
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DepthChartPlayer {
  name: string;
  position: string;
  team: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { team } = await req.json();
    
    if (!team) {
      throw new Error('Team parameter is required');
    }

    console.log(`Scraping ESPN depth chart for team: ${team}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Transform team name for ESPN URL
    let espnTeam = team.toUpperCase();
    if (espnTeam === 'NOP') espnTeam = 'NO';
    if (espnTeam === 'UTA') espnTeam = 'UTAH';

    const teamUrl = `https://www.espn.com/nba/team/depth/_/name/${espnTeam}`;
    console.log(`Fetching from URL: ${teamUrl}`);

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    const response = await fetch(teamUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    const tables = doc.querySelectorAll('table');
    
    if (tables.length < 2) {
      throw new Error('Depth chart table not found');
    }

    const depthChartTable = tables[1];
    const players: DepthChartPlayer[] = [];
    const positions = ['PG', 'SG', 'SF', 'PF', 'C'];

    const rows = depthChartTable.querySelectorAll('tr');
    
    for (let rowIndex = 0; rowIndex < rows.length && rowIndex < positions.length; rowIndex++) {
      const row = rows[rowIndex];
      const cells = row.querySelectorAll('td');
      
      for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
        const cell = cells[cellIndex];
        let playerName = cell.textContent?.trim() || '';
        
        // Clean player name (remove suffixes like " DD", " O")
        playerName = playerName.replace(/\s+(DD|O)$/, '');
        
        if (playerName && playerName !== '') {
          players.push({
            name: playerName,
            position: positions[rowIndex],
            team: team
          });
        }
      }
    }

    // Update player positions in database
    for (const player of players) {
      const { error } = await supabaseClient
        .from('players')
        .update({ position: player.position })
        .eq('display_name', player.name);

      if (error) {
        console.error(`Error updating player ${player.name}:`, error);
      }
    }

    console.log(`Successfully processed ${players.length} players for team ${team}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        team,
        players_count: players.length,
        players 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('ESPN scraping error:', error);
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
