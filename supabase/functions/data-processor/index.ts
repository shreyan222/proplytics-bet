
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PropData {
  prop_id: string;
  player_id: string;
  player_name: string;
  position: string;
  team: string;
  stat_type: string;
  line_score: number;
  odds_type: 'standard' | 'demon' | 'goblin';
  game_id: string;
  start_time: string;
  h2h_array: number[];
  l5_array: number[];
  h2h_avg: number;
  l5_avg: number;
  h2h_score: number;
  l5_score: number;
  sample_size: number;
  sorting_score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting data processing pipeline...');

    // Simulate fetching data from PrizePicks API (equivalent to your data.json)
    const mockPropData: PropData[] = [
      {
        prop_id: 'prop_1',
        player_id: 'player_1',
        player_name: 'LeBron James',
        position: 'SF',
        team: 'LAL',
        stat_type: 'Points',
        line_score: 25.5,
        odds_type: 'standard',
        game_id: 'game_1',
        start_time: '2024-01-15T20:00:00Z',
        h2h_array: [28, 31, 22, 29, 26],
        l5_array: [30, 24, 27, 29, 25],
        h2h_avg: 27.2,
        l5_avg: 27.0,
        h2h_score: 0.8,
        l5_score: 0.6,
        sample_size: 5,
        sorting_score: 0.75
      }
    ];

    // Process and validate data
    const processedProps = await processPropsData(mockPropData);
    
    // Store in database
    const { data: insertedProps, error: propsError } = await supabaseClient
      .from('props')
      .upsert(processedProps.map(prop => ({
        id: prop.prop_id,
        external_id: prop.prop_id,
        player_id: prop.player_id,
        game_id: prop.game_id,
        stat_type: prop.stat_type,
        line_score: prop.line_score,
        odds_type: prop.odds_type,
        h2h_array: prop.h2h_array,
        l5_array: prop.l5_array,
        h2h_avg: prop.h2h_avg,
        l5_avg: prop.l5_avg,
        h2h_score: prop.h2h_score,
        l5_score: prop.l5_score,
        sample_size: prop.sample_size,
        sorting_score: prop.sorting_score,
      })), { onConflict: 'external_id' });

    if (propsError) {
      console.error('Error inserting props:', propsError);
      throw propsError;
    }

    console.log(`Successfully processed ${processedProps.length} props`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_count: processedProps.length,
        message: 'Data processing completed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Data processing error:', error);
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

async function processPropsData(rawProps: PropData[]): Promise<PropData[]> {
  console.log('Processing props data...');
  
  return rawProps.map(prop => {
    // Apply scoring algorithm (equivalent to combinetoverPropraternum2)
    const scoringResult = calculateSortingScore(prop);
    
    return {
      ...prop,
      sorting_score: scoringResult.sorting_score,
      h2h_score: scoringResult.h2h_score,
      l5_score: scoringResult.l5_score
    };
  });
}

function calculateSortingScore(prop: PropData) {
  // Implement your exact scoring algorithm
  // H2H 45%, relative diff 20%, sample size 20%, L5 10%, L5 relative diff 5%
  
  const h2hTemp = prop.h2h_array.filter(val => val >= prop.line_score).length;
  const h2hSize = prop.h2h_array.length || 1;
  const h2hScore = h2hTemp / h2hSize;
  
  const l5Temp = prop.l5_array.filter(val => val >= prop.line_score).length;
  const l5Size = prop.l5_array.length || 1;
  const l5Score = l5Temp / l5Size;
  
  const h2hRelativeDiff = (prop.h2h_avg - prop.line_score) / (prop.line_score + 5);
  const l5RelativeDiff = (prop.l5_avg - prop.line_score) / (prop.line_score + 5);
  
  const sortingScore = (
    (h2hScore * 0.45) +
    (h2hRelativeDiff * 0.20) +
    (prop.sample_size * 0.20) +
    (l5Score * 0.1) +
    (l5RelativeDiff * 0.05)
  );
  
  return {
    sorting_score: Number(sortingScore.toFixed(3)),
    h2h_score: Number(h2hScore.toFixed(3)),
    l5_score: Number(l5Score.toFixed(3))
  };
}
