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
  
  // First, get existing props to avoid redundant processing
  const existingPropsQuery = await supabase
    .from('props')
    .select('id, player_name, stat_type, line_score, odds_type, team_name, league_id')
    .in('league_id', [7, 9]); // NBA and NFL league IDs
  
  if (existingPropsQuery.error) {
    console.error('Error fetching existing props:', existingPropsQuery.error);
    throw existingPropsQuery.error;
  }
  
  // Create a set of existing prop identifiers for fast lookup
  const existingPropsSet = new Set();
  existingPropsQuery.data.forEach(prop => {
    const propKey = `${prop.player_name}|${prop.stat_type}|${prop.line_score}|${prop.odds_type}|${prop.team_name}|${prop.league_id}`;
    existingPropsSet.add(propKey);
  });
  
  console.log(`Found ${existingPropsQuery.data.length} existing props in database`);
  
  // Filter out props that already exist
  const newProps = payload.props.filter(prop => {
    const propKey = `${prop.player_name}|${prop.stat_type}|${prop.line_score}|${prop.odds_type}|${prop.team_name}|${prop.league_id}`;
    return !existingPropsSet.has(propKey);
  });
  
  console.log(`Filtered to ${newProps.length} new props that need processing`);
  
  if (newProps.length === 0) {
    console.log('No new props to process');
    return {
      teams_processed: 0,
      players_processed: 0,
      games_processed: 0,
      props_processed: 0,
      existing_props_skipped: payload.props.length,
      errors: []
    };
  }
  
  const results = {
    teams_processed: 0,
    players_processed: 0,
    games_processed: 0,
    props_processed: 0,
    existing_props_skipped: payload.props.length - newProps.length,
    errors: []
  };
  
  const teamMap = new Map();
  const playerMap = new Map();
  const gameMap = new Map();
  
  // === Teams ===
  const uniqueTeams = [
    ...new Set(newProps.map((p)=>p.team_name))
  ];
  for (const teamName of uniqueTeams){
    try {
      const { data: existingTeam } = await supabase.from("teams").select("id").eq("abbreviation", teamName).maybeSingle();
      if (!existingTeam) {
        const { data: newTeam, error } = await supabase.from("teams").insert({
          abbreviation: teamName,
          city: teamName,
          full_name: `${teamName} Team`
        }).select().single();
        if (!error && newTeam) {
          teamMap.set(teamName, newTeam.id);
          results.teams_processed++;
        }
      } else {
        teamMap.set(teamName, existingTeam.id);
      }
    } catch (error) {
      results.errors.push(`Team ${teamName}: ${error.message}`);
    }
  }
  
  // === Players ===
  const uniquePlayers = [
    ...new Set(newProps.map((p)=>`${p.player_name}|${p.team_name}|${p.position}`))
  ];
  for (const playerKey of uniquePlayers){
    const [playerName, teamName, position] = playerKey.split("|");
    const teamId = teamMap.get(teamName);
    if (!teamId) continue;
    try {
      const { data: existingPlayer } = await supabase.from("players").select("id").eq("display_name", playerName).eq("team_id", teamId).maybeSingle();
      if (!existingPlayer) {
        const { data: newPlayer, error } = await supabase.from("players").insert({
          display_name: playerName,
          position,
          team_id: teamId,
          is_active: true
        }).select().single();
        if (!error && newPlayer) {
          playerMap.set(`${playerName}|${teamName}`, newPlayer.id);
          results.players_processed++;
        }
      } else {
        playerMap.set(`${playerName}|${teamName}`, existingPlayer.id);
      }
    } catch (error) {
      results.errors.push(`Player ${playerName}: ${error.message}`);
    }
  }
  
  // === Games ===
  const uniqueGames = [
    ...new Set(newProps.filter((p)=>p.game_id && p.start_time && p.against_team).map((p)=>`${p.game_id}|${p.team_name}|${p.against_team}|${p.start_time}`))
  ];
  for (const gameKey of uniqueGames){
    const [gameId, teamName, againstTeam, startTime] = gameKey.split("|");
    const homeTeamId = teamMap.get(teamName);
    const awayTeamId = teamMap.get(againstTeam);
    if (!homeTeamId || !awayTeamId) continue;
    try {
      const { data: existingGame } = await supabase.from("games").select("id").eq("external_id", gameId).maybeSingle();
      if (!existingGame) {
        const { data: newGame, error } = await supabase.from("games").insert({
          external_id: gameId,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          start_time: startTime,
          status: "scheduled"
        }).select().single();
        if (!error && newGame) {
          gameMap.set(gameId, newGame.id);
          results.games_processed++;
        }
      } else {
        gameMap.set(gameId, existingGame.id);
      }
    } catch (error) {
      results.errors.push(`Game ${gameId}: ${error.message}`);
    }
  }
  
  // === Props ===
  for (const propData of newProps){
    try {
      const playerId = playerMap.get(`${propData.player_name}|${propData.team_name}`);
      const gameId = propData.game_id ? gameMap.get(propData.game_id) : null;
      console.log(`Processing prop: ${propData.player_name} - ${propData.stat_type}`);
      console.log(`Player ID: ${playerId}, Game ID: ${gameId}`);
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
        h2h_array: Array.isArray(propData.h2h_array) ? propData.h2h_array.map(Number) : typeof propData.h2h_array === "string" ? propData.h2h_array.split(",").map(Number) : [],
        l5_array: Array.isArray(propData.l5_array) ? propData.l5_array.map(Number) : typeof propData.l5_array === "string" ? propData.l5_array.split(",").map(Number) : [],
        h2h_avg: Number(propData.h2h_avg) || 0,
        l5_avg: Number(propData.l5_avg) || 0,
        h2h_score: Number(propData.h2h_score) || 0,
        l5_score: Number(propData.l5_score) || 0,
        sample_size: Number(propData.sample_size) || 0,
        sorting_score: Number(propData.sorting_score) || 0,
        league: propData.league,
        sync_run_id: jobId
      };
      console.log(`Prop payload:`, JSON.stringify(propPayload, null, 2));
      const { data, error } = await supabase.from("props").upsert(propPayload, {
        onConflict: "player_id,stat_type,odds_type,line_score"
      });
      if (error) {
        console.error(`Database error for prop ${propData.player_name}:`, error);
        results.errors.push(`Prop ${propData.player_name} ${propData.stat_type}: ${error.message}`);
      } else {
        console.log(`Successfully processed prop: ${propData.player_name}`);
        results.props_processed++;
      }
    } catch (error) {
      console.error(`Unexpected error for prop ${propData.player_name}:`, error);
      results.errors.push(`Prop ${propData.player_name} ${propData.stat_type}: ${error.message}`);
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
