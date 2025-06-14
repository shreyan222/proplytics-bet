
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropData {
  player_name: string;
  position: string;
  stat_type: string;
  line_score: number;
  odds_type: string;
  team_name: string;
  league_id: string;
  game_id?: string;
  h2h_array: number[];
  l5_array: number[];
  h2h_avg: number;
  l5_avg: number;
  h2h_score: number;
  l5_score: number;
  sample_size: number;
  sorting_score: number;
  start_time?: string;
  against_team?: string;
}

interface IngestionPayload {
  job_type: 'prizepicks_scrape' | 'espn_scrape' | 'statmuse_fetch';
  props?: PropData[];
  teams?: any[];
  players?: any[];
  games?: any[];
  metadata?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const payload: IngestionPayload = await req.json();
    console.log(`Starting ${payload.job_type} ingestion job`);

    // Create ingestion job record
    const { data: job, error: jobError } = await supabase
      .from('data_ingestion_jobs')
      .insert({
        job_type: payload.job_type,
        status: 'running',
        metadata: payload.metadata || {}
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      throw jobError;
    }

    console.log(`Created job ${job.id} for ${payload.job_type}`);

    let result: any = {};

    switch (payload.job_type) {
      case 'prizepicks_scrape':
        result = await processPrizePicksData(supabase, payload);
        break;
      case 'espn_scrape':
        result = await processESPNData(supabase, payload);
        break;
      case 'statmuse_fetch':
        result = await processStatMuseData(supabase, payload);
        break;
      default:
        throw new Error(`Unknown job type: ${payload.job_type}`);
    }

    // Update job status to completed
    await supabase
      .from('data_ingestion_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: { ...payload.metadata, result }
      })
      .eq('id', job.id);

    console.log(`Completed job ${job.id} successfully`);

    return new Response(JSON.stringify({
      success: true,
      job_id: job.id,
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Ingestion error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processPrizePicksData(supabase: any, payload: IngestionPayload) {
  if (!payload.props) {
    throw new Error('No props data provided');
  }

  console.log(`Processing ${payload.props.length} props`);
  
  const results = {
    teams_processed: 0,
    players_processed: 0,
    games_processed: 0,
    props_processed: 0,
    errors: []
  };

  // Process teams first
  const teamMap = new Map();
  const playerMap = new Map();
  const gameMap = new Map();

  // Extract unique teams
  const uniqueTeams = [...new Set(payload.props.map(p => p.team_name))];
  for (const teamName of uniqueTeams) {
    try {
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('abbreviation', teamName)
        .single();

      if (!existingTeam) {
        const { data: newTeam, error } = await supabase
          .from('teams')
          .insert({
            abbreviation: teamName,
            city: teamName,
            full_name: `${teamName} Team`
          })
          .select()
          .single();

        if (!error && newTeam) {
          teamMap.set(teamName, newTeam.id);
          results.teams_processed++;
        }
      } else {
        teamMap.set(teamName, existingTeam.id);
      }
    } catch (error) {
      console.error(`Error processing team ${teamName}:`, error);
      results.errors.push(`Team ${teamName}: ${error.message}`);
    }
  }

  // Process players
  const uniquePlayers = [...new Set(payload.props.map(p => 
    `${p.player_name}|${p.team_name}|${p.position}`
  ))];

  for (const playerKey of uniquePlayers) {
    const [playerName, teamName, position] = playerKey.split('|');
    const teamId = teamMap.get(teamName);
    
    if (!teamId) continue;

    try {
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('display_name', playerName)
        .eq('team_id', teamId)
        .single();

      if (!existingPlayer) {
        const { data: newPlayer, error } = await supabase
          .from('players')
          .insert({
            display_name: playerName,
            position: position,
            team_id: teamId,
            is_active: true
          })
          .select()
          .single();

        if (!error && newPlayer) {
          playerMap.set(`${playerName}|${teamName}`, newPlayer.id);
          results.players_processed++;
        }
      } else {
        playerMap.set(`${playerName}|${teamName}`, existingPlayer.id);
      }
    } catch (error) {
      console.error(`Error processing player ${playerName}:`, error);
      results.errors.push(`Player ${playerName}: ${error.message}`);
    }
  }

  // Process games
  const uniqueGames = [...new Set(payload.props
    .filter(p => p.game_id && p.start_time && p.against_team)
    .map(p => `${p.game_id}|${p.team_name}|${p.against_team}|${p.start_time}`)
  )];

  for (const gameKey of uniqueGames) {
    const [gameId, teamName, againstTeam, startTime] = gameKey.split('|');
    const homeTeamId = teamMap.get(teamName);
    const awayTeamId = teamMap.get(againstTeam);
    
    if (!homeTeamId || !awayTeamId) continue;

    try {
      const { data: existingGame } = await supabase
        .from('games')
        .select('id')
        .eq('external_id', gameId)
        .single();

      if (!existingGame) {
        const { data: newGame, error } = await supabase
          .from('games')
          .insert({
            external_id: gameId,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            start_time: startTime,
            status: 'scheduled'
          })
          .select()
          .single();

        if (!error && newGame) {
          gameMap.set(gameId, newGame.id);
          results.games_processed++;
        }
      } else {
        gameMap.set(gameId, existingGame.id);
      }
    } catch (error) {
      console.error(`Error processing game ${gameId}:`, error);
      results.errors.push(`Game ${gameId}: ${error.message}`);
    }
  }

  // Process props
  for (const propData of payload.props) {
    try {
      const playerId = playerMap.get(`${propData.player_name}|${propData.team_name}`);
      const gameId = propData.game_id ? gameMap.get(propData.game_id) : null;
      
      if (!playerId) {
        results.errors.push(`Player not found: ${propData.player_name}`);
        continue;
      }

      // Check if prop already exists
      const { data: existingProp } = await supabase
        .from('props')
        .select('id')
        .eq('player_id', playerId)
        .eq('stat_type', propData.stat_type)
        .eq('line_score', propData.line_score)
        .eq('odds_type', propData.odds_type)
        .maybeSingle();

      const propPayload = {
        player_id: playerId,
        game_id: gameId,
        stat_type: propData.stat_type,
        line_score: propData.line_score,
        odds_type: propData.odds_type,
        h2h_array: propData.h2h_array || [],
        l5_array: propData.l5_array || [],
        h2h_avg: propData.h2h_avg || 0,
        l5_avg: propData.l5_avg || 0,
        h2h_score: propData.h2h_score || 0,
        l5_score: propData.l5_score || 0,
        sample_size: propData.sample_size || 0,
        sorting_score: propData.sorting_score || 0
      };

      if (existingProp) {
        // Update existing prop
        const { error } = await supabase
          .from('props')
          .update(propPayload)
          .eq('id', existingProp.id);

        if (!error) {
          results.props_processed++;
        }
      } else {
        // Insert new prop
        const { error } = await supabase
          .from('props')
          .insert(propPayload);

        if (!error) {
          results.props_processed++;
        }
      }
    } catch (error) {
      console.error(`Error processing prop for ${propData.player_name}:`, error);
      results.errors.push(`Prop ${propData.player_name} ${propData.stat_type}: ${error.message}`);
    }
  }

  return results;
}

async function processESPNData(supabase: any, payload: IngestionPayload) {
  // Implementation for ESPN depth chart data
  return { message: 'ESPN data processing not yet implemented' };
}

async function processStatMuseData(supabase: any, payload: IngestionPayload) {
  // Implementation for StatMuse data
  return { message: 'StatMuse data processing not yet implemented' };
}
