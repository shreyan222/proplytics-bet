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
  // Get league IDs from the payload props
  const leagueIds = [
    ...new Set(payload.props.map((p)=>p.league_id || (p.league === 'NBA' ? 7 : 9)))
  ];
  console.log(`Processing props for leagues: ${leagueIds.join(', ')}`);
  // Get existing props for the same leagues to avoid redundant processing
  const existingPropsQuery = await supabase.from('props').select('id, player_name, stat_type, line_score, odds_type, team_name, league_id, sync_run_id').in('league_id', leagueIds);
  if (existingPropsQuery.error) {
    console.error('Error fetching existing props:', existingPropsQuery.error);
    throw existingPropsQuery.error;
  }
  console.log(`Found ${existingPropsQuery.data.length} existing props in database for leagues ${leagueIds.join(', ')}`);
  // Create a set of current prop identifiers for fast lookup
  const currentPropsSet = new Set();
  payload.props.forEach((prop)=>{
    const propKey = `${prop.player_name}|${prop.stat_type}|${prop.line_score}|${prop.odds_type}|${prop.team_name}|${prop.league_id || (prop.league === 'NBA' ? 7 : 9)}`;
    currentPropsSet.add(propKey);
  });
  // Identify props that need to be deleted (exist in DB but not in current batch)
  const propsToDelete = existingPropsQuery.data.filter((existingProp)=>{
    const propKey = `${existingProp.player_name}|${existingProp.stat_type}|${existingProp.line_score}|${existingProp.odds_type}|${existingProp.team_name}|${existingProp.league_id}`;
    return !currentPropsSet.has(propKey);
  });
  console.log(`Found ${propsToDelete.length} stale props to delete`);
  // Delete stale props in batches for efficiency
  if (propsToDelete.length > 0) {
    const deleteIds = propsToDelete.map((p)=>p.id);
    const batchSize = 1000; // Supabase batch limit
    for(let i = 0; i < deleteIds.length; i += batchSize){
      const batch = deleteIds.slice(i, i + batchSize);
      const { error: deleteError } = await supabase.from('props').delete().in('id', batch);
      if (deleteError) {
        console.error(`Error deleting batch ${i}-${i + batch.length}:`, deleteError);
      } else {
        console.log(`Deleted batch ${i}-${i + batch.length} (${batch.length} props)`);
      }
    }
  }
  // Since props are already filtered by Python code, process all incoming props
  const propsToUpsert = payload.props;
  console.log(`Processing ${propsToUpsert.length} props (already filtered by Python code)`);
  
  if (propsToUpsert.length === 0 && propsToDelete.length === 0) {
    console.log('No props to process - database is already up to date');
    return {
      teams_processed: 0,
      players_processed: 0,
      games_processed: 0,
      props_processed: 0,
      props_deleted: 0,
      existing_props_skipped: 0,
      errors: []
    };
  }
  const results = {
    teams_processed: 0,
    players_processed: 0,
    games_processed: 0,
    props_processed: 0,
    props_deleted: propsToDelete.length,
    existing_props_skipped: 0, // No filtering done here - already done by Python
    errors: []
  };
  const teamMap = new Map();
  const playerMap = new Map();
  const gameMap = new Map();
  // === Teams ===
  const uniqueTeams = [
    ...new Set(propsToUpsert.map((p)=>p.team_name))
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
    ...new Set(propsToUpsert.map((p)=>`${p.player_name}|${p.team_name}|${p.position}`))
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
    ...new Set(propsToUpsert.filter((p)=>p.game_id && p.start_time && p.against_team && p.against_team !== 'Unknown').map((p)=>`${p.game_id}|${p.team_name}|${p.against_team}|${p.start_time}`))
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
  // Process props in batches for better performance
  const batchSize = 100; // Smaller batch size for props due to complexity
  const propBatches = [];
  for(let i = 0; i < propsToUpsert.length; i += batchSize){
    propBatches.push(propsToUpsert.slice(i, i + batchSize));
  }
  console.log(`Processing ${propsToUpsert.length} props in ${propBatches.length} batches`);
  for(let batchIndex = 0; batchIndex < propBatches.length; batchIndex++){
    const batch = propBatches[batchIndex];
    console.log(`Processing batch ${batchIndex + 1}/${propBatches.length} (${batch.length} props)`);
    const batchPayloads = [];
    for (const propData of batch){
      try {
        const playerId = playerMap.get(`${propData.player_name}|${propData.team_name}`);
        const gameId = propData.game_id ? gameMap.get(propData.game_id) : null;
        let finalPlayerId = playerId;
        let finalGameId = gameId;
        // If player not found, insert a placeholder player
        if (!finalPlayerId) {
          try {
            const { data: placeholderPlayer, error } = await supabase.from("players").insert({
              display_name: propData.player_name,
              position: propData.position || "UNK",
              team_id: teamMap.get(propData.team_name) || null,
              is_active: false
            }).select().single();
            if (!error && placeholderPlayer) {
              finalPlayerId = placeholderPlayer.id;
              results.players_processed++;
              console.log(`⚠️ Created placeholder player for ${propData.player_name}`);
            }
          } catch (err) {
            results.errors.push(`Placeholder player failed: ${propData.player_name} (${err.message})`);
          }
        }
        // If game not found, allow null but log warning
        if (!finalGameId && propData.game_id) {
          console.log(`⚠️ No game found for ${propData.game_id}, leaving game_id null`);
        }
        const propPayload = {
          player_id: finalPlayerId,
          game_id: finalGameId,
          player_name: propData.player_name,
          stat_type: propData.stat_type,
          line_score: propData.line_score,
          odds_type: propData.odds_type,
          team_name: propData.team_name,
          against_team: propData.against_team,
          league_id: propData.league_id || (propData.league === "NBA" ? 7 : 9),
          matchup_rank: propData.matchup_rank ? Number(propData.matchup_rank) : null,  // ✅ Add matchup rank
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
        batchPayloads.push(propPayload);
      } catch (error) {
        console.error(`Error preparing prop ${propData.player_name}:`, error);
        results.errors.push(`Prop ${propData.player_name} ${propData.stat_type}: ${error.message}`);
      }
    }
    // Batch upsert for this batch
    if (batchPayloads.length > 0) {
      try {
        // Deduplicate batch payloads to avoid "cannot affect row a second time" error
        const uniqueBatchPayloads = [];
        const seenKeys = new Set();
        
        for (const payload of batchPayloads) {
          const key = `${payload.player_id}|${payload.stat_type}|${payload.odds_type}|${payload.line_score}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueBatchPayloads.push(payload);
          } else {
            console.log(`Skipping duplicate prop: ${payload.player_name} - ${payload.stat_type} ${payload.line_score} (${payload.odds_type})`);
          }
        }
        
        console.log(`Deduplicated batch ${batchIndex + 1}: ${batchPayloads.length} -> ${uniqueBatchPayloads.length} props`);
        
        const { data, error } = await supabase.from("props").upsert(uniqueBatchPayloads, {
          onConflict: "player_id,stat_type,odds_type,line_score"
        });
        if (error) {
          console.error(`Batch upsert error for batch ${batchIndex + 1}:`, error);
          results.errors.push(`Batch ${batchIndex + 1}: ${error.message}`);
        } else {
          console.log(`Successfully processed batch ${batchIndex + 1} (${uniqueBatchPayloads.length} props)`);
          results.props_processed += uniqueBatchPayloads.length;
        }
      } catch (error) {
        console.error(`Unexpected error in batch ${batchIndex + 1}:`, error);
        results.errors.push(`Batch ${batchIndex + 1}: ${error.message}`);
      }
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
