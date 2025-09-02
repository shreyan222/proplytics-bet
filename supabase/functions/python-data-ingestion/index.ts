import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  try {
    const payload = await req.json();
    console.log(`Starting ${payload.job_type} ingestion job`);
    // Create ingestion job record
    const { data: job, error: jobError } = await supabase.from('data_ingestion_jobs').insert({
      job_type: payload.job_type,
      status: 'running',
      metadata: payload.metadata || {}
    }).select().single();
    if (jobError) {
      console.error('Error creating job:', jobError);
      throw jobError;
    }
    console.log(`Created job ${job.id} for ${payload.job_type}`);
    let result = {};
    switch(payload.job_type){
      case 'prizepicks_scrape':
        result = await processPrizePicksData(supabase, payload, job.id);
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
    await supabase.from('data_ingestion_jobs').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      metadata: {
        ...payload.metadata,
        result
      }
    }).eq('id', job.id);
    console.log(`Completed job ${job.id} successfully`);
    return new Response(JSON.stringify({
      success: true,
      job_id: job.id,
      result
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
async function processPrizePicksData(supabase, payload, jobId) {
  if (!payload.props) {
    throw new Error('No props data provided');
  }
  console.log(`Processing ${payload.props.length} props`);
  
  if (payload.props.length === 0) {
    console.log('No props provided - early exit');
    return {
      teams_processed: 0,
      players_processed: 0,
      games_processed: 0,
      props_processed: 0,
      existing_props_skipped: 0,
      errors: []
    };
  }

  const results = {
    teams_processed: 0,
    players_processed: 0,
    games_processed: 0,
    props_processed: 0,
    existing_props_skipped: 0,
    errors: []
  };

  const teamMap = new Map();
  const playerMap = new Map();
  const gameMap = new Map();

  // Process all teams
  const uniqueTeams = [...new Set(payload.props.map(p => p.team_name))];
  console.log(`Processing ${uniqueTeams.length} unique teams`);

  for (const teamName of uniqueTeams) {
    const { data: existingTeam } = await supabase
      .from("teams")
      .select("id, abbreviation")
      .eq("abbreviation", teamName)
      .single();

    if (existingTeam) {
      teamMap.set(teamName, existingTeam.id);
    } else {
      const { data: newTeam, error } = await supabase
        .from("teams")
        .insert({
          abbreviation: teamName,
          city: teamName,
          full_name: `${teamName} Team`
        })
        .select("id")
        .single();

      if (error) {
        results.errors.push(`Team insert error: ${error.message}`);
      } else {
        teamMap.set(teamName, newTeam.id);
        results.teams_processed++;
      }
    }
  }

  // Process all players
  const uniquePlayers = [...new Set(payload.props.map(p => `${p.player_name}|${p.team_name}|${p.position || 'Unknown'}`))];
  console.log(`Processing ${uniquePlayers.length} unique players`);

  for (const playerKey of uniquePlayers) {
    const [playerName, teamName, position] = playerKey.split("|");
    const teamId = teamMap.get(teamName);

    if (!teamId) continue;

    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id")
      .eq("display_name", playerName)
      .eq("team_id", teamId)
      .single();

    if (existingPlayer) {
      playerMap.set(playerKey, existingPlayer.id);
    } else {
      const { data: newPlayer, error } = await supabase
        .from("players")
        .insert({
          display_name: playerName,
          position: position,
          team_id: teamId,
          is_active: true
        })
        .select("id")
        .single();

      if (error) {
        results.errors.push(`Player insert error: ${error.message}`);
      } else {
        playerMap.set(playerKey, newPlayer.id);
        results.players_processed++;
      }
    }
  }

  // Process all games
  const uniqueGames = [...new Set(payload.props
    .filter(p => p.game_id && p.start_time && p.against_team)
    .map(p => `${p.game_id}|${p.team_name}|${p.against_team}|${p.start_time}`))];
  console.log(`Processing ${uniqueGames.length} unique games`);

  for (const gameKey of uniqueGames) {
    const [gameId, teamName, againstTeam, startTime] = gameKey.split("|");
    const homeTeamId = teamMap.get(teamName);
    const awayTeamId = teamMap.get(againstTeam);

    if (!homeTeamId || !awayTeamId) continue;

    const { data: existingGame } = await supabase
      .from("games")
      .select("id")
      .eq("external_id", gameId)
      .single();

    if (existingGame) {
      gameMap.set(gameId, existingGame.id);
    } else {
      const { data: newGame, error } = await supabase
        .from("games")
        .insert({
          external_id: gameId,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          start_time: startTime,
          status: "scheduled"
        })
        .select("id")
        .single();

      if (error) {
        results.errors.push(`Game insert error: ${error.message}`);
      } else {
        gameMap.set(gameId, newGame.id);
        results.games_processed++;
      }
    }
  }

  // Process all props at once
  const propsToInsert = [];
  console.log(`Processing ${payload.props.length} props for insertion`);

  for (const propData of payload.props) {
    const playerKey = `${propData.player_name}|${propData.team_name}|${propData.position || 'Unknown'}`;
    const playerId = playerMap.get(playerKey);
    const gameId = propData.game_id ? gameMap.get(propData.game_id) : null;

    if (!playerId) {
      results.errors.push(`Player not found: ${propData.player_name}`);
      continue;
    }

    const propPayload = {
      player_id: playerId,
      game_id: gameId,
      player_name: propData.player_name,
      stat_type: propData.stat_type,
      line_score: propData.line_score,
      odds_type: propData.odds_type,
      team_name: propData.team_name,
      league_id: propData.league_id || (propData.league === 'NBA' ? 7 : 9),
      h2h_array: Array.isArray(propData.h2h_array) ? propData.h2h_array.map(Number) : [],
      l5_array: Array.isArray(propData.l5_array) ? propData.l5_array.map(Number) : [],
      h2h_avg: Number(propData.h2h_avg) || 0,
      l5_avg: Number(propData.l5_avg) || 0,
      h2h_score: Number(propData.h2h_score) || 0,
      l5_score: Number(propData.l5_score) || 0,
      sample_size: Number(propData.sample_size) || 0,
      sorting_score: Number(propData.sorting_score) || 0,
      league: propData.league,
      sync_run_id: jobId
    };

    propsToInsert.push(propPayload);
  }

  // Remove duplicates within the same batch to avoid upsert conflicts
  if (propsToInsert.length > 0) {
    console.log(`Removing duplicates from ${propsToInsert.length} props...`);
    
    // Create a map to track unique props by their conflict key
    const uniquePropsMap = new Map();
    
    for (const prop of propsToInsert) {
      const conflictKey = `${prop.player_id}|${prop.stat_type}|${prop.odds_type}|${prop.line_score}`;
      
      // Keep the last occurrence (most recent data)
      uniquePropsMap.set(conflictKey, prop);
    }
    
    const uniqueProps = Array.from(uniquePropsMap.values());
    const duplicatesRemoved = propsToInsert.length - uniqueProps.length;
    
    console.log(`Removed ${duplicatesRemoved} duplicates, inserting ${uniqueProps.length} unique props`);
    
    const { data, error } = await supabase
      .from("props")
      .upsert(uniqueProps, {
        onConflict: "player_id,stat_type,odds_type,line_score"
      });

    if (error) {
      console.error('Props insert error:', error);
      results.errors.push(`Props insert: ${error.message}`);
    } else {
      results.props_processed = uniqueProps.length;
      console.log(`Successfully inserted ${uniqueProps.length} props`);
    }
  }

  return results;
}



async function processESPNData(supabase, payload) {
  // Implementation for ESPN depth chart data
  return {
    message: 'ESPN data processing not yet implemented'
  };
}
async function processStatMuseData(supabase, payload) {
  // Implementation for StatMuse data
  return {
    message: 'StatMuse data processing not yet implemented'
  };
}
