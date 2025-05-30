
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StatMuseData {
  player_name: string;
  against_team: string;
  timeframe: string;
  stats: number[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { player_name, against_team, timeframe, stat_type } = await req.json();
    
    if (!player_name || !against_team || !timeframe) {
      throw new Error('player_name, against_team, and timeframe are required');
    }

    console.log(`Fetching StatMuse data for ${player_name} vs ${against_team} (${timeframe})`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle special cases for team names
    let teamName = against_team;
    if (teamName === "MIN") teamName = "Minesota";

    // Handle special cases for player names
    let playerName = player_name;
    if (playerName === "Nicolas Claxton") playerName = "Claxton";

    const url = `https://www.statmuse.com/nba/ask/${playerName}-against-${teamName}-${timeframe}-including-playoffs`;
    console.log(`Fetching from URL: ${url}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    const table = doc.querySelector('table.whitespace-nowrap.w-full');
    
    if (!table) {
      console.log('No stats table found for this query');
      return new Response(
        JSON.stringify({ 
          success: true, 
          player_name,
          against_team,
          timeframe,
          stats: [],
          message: 'No data found'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const stats: string[] = [];
    const rows = table.querySelectorAll('tr');

    for (const row of rows) {
      const cells = row.querySelectorAll('td, th');
      for (const cell of cells) {
        const statText = cell.textContent?.trim() || '';
        stats.push(statText);
      }
    }

    // Truncate at double empty elements (equivalent to your Python function)
    const truncatedStats = truncateListAfterTwoEmptyElements(stats);

    // Extract specific stat based on stat_type
    const specificStats = extractSpecificStat(truncatedStats, stat_type || 'Points');

    console.log(`Successfully extracted ${specificStats.length} stats for ${player_name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        player_name,
        against_team,
        timeframe,
        stat_type,
        stats: specificStats,
        raw_stats_count: truncatedStats.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('StatMuse scraping error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function truncateListAfterTwoEmptyElements(arr: string[]): string[] {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === "" && arr[i + 1] === "") {
      return arr.slice(0, i);
    }
  }
  return arr;
}

function extractSpecificStat(arr: string[], statType: string): number[] {
  const findStat = (offset: number, arr: string[]): number[] => {
    const result: number[] = [];
    for (let i = 28; i < arr.length; i++) {
      if ((i - offset) % 28 === 0) {
        const cleanStat = arr[i].replace(/\s/g, '');
        const numValue = parseInt(cleanStat);
        if (!isNaN(numValue)) {
          result.push(numValue);
        }
      }
    }
    return result;
  };

  switch (statType) {
    case "Points": return findStat(8, arr);
    case "Min": return findStat(7, arr);
    case "Rebounds": return findStat(9, arr);
    case "Assists": return findStat(10, arr);
    case "Steals": return findStat(11, arr);
    case "Blocked Shots": return findStat(12, arr);
    case "Turnovers": return findStat(25, arr);
    case "3-PT Made": return findStat(16, arr);
    case "Free Throws Made": return findStat(19, arr);
    case "Pts+Rebs": {
      const points = findStat(8, arr);
      const rebounds = findStat(9, arr);
      return points.map((p, i) => p + (rebounds[i] || 0));
    }
    case "Pts+Asts": {
      const points = findStat(8, arr);
      const assists = findStat(10, arr);
      return points.map((p, i) => p + (assists[i] || 0));
    }
    case "Blks+Stls": {
      const steals = findStat(11, arr);
      const blocks = findStat(12, arr);
      return steals.map((s, i) => s + (blocks[i] || 0));
    }
    default:
      return findStat(8, arr); // Default to points
  }
}
