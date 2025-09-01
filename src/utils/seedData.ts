
import { supabase } from '@/integrations/supabase/client';

export const seedSampleData = async () => {
  try {
    // First, let's add some players for the existing teams
    const { data: teams } = await supabase.from('teams').select('*');
    if (!teams || teams.length === 0) {
      console.error('No teams found. Please ensure teams are seeded first.');
      return;
    }

    // Sample players data
    const playersData = [
      { display_name: 'Mikal Bridges', position: 'SG', team_abbreviation: 'NYK' },
      { display_name: 'Luka Doncic', position: 'PG', team_abbreviation: 'LAL' },
      { display_name: 'Jimmy Butler', position: 'SF', team_abbreviation: 'MIA' },
      { display_name: 'Jayson Tatum', position: 'SF', team_abbreviation: 'BOS' },
      { display_name: 'Stephen Curry', position: 'PG', team_abbreviation: 'GSW' },
      { display_name: 'Victor Wembanyama', position: 'C', team_abbreviation: 'SAS' },
    ];

    // Insert players
    for (const playerData of playersData) {
      const team = teams.find(t => t.abbreviation === playerData.team_abbreviation);
      if (team) {
        await supabase.from('players').upsert({
          display_name: playerData.display_name,
          position: playerData.position,
          team_id: team.id,
          external_id: `player_${playerData.display_name.replace(/\s+/g, '_').toLowerCase()}`,
        }, { onConflict: 'external_id' });
      }
    }

    // Create sample games
    const gamesData = [
      { home_team: 'NYK', away_team: 'MIA', start_time: '2025-01-27T19:00:00Z' },
      { home_team: 'LAL', away_team: 'SAS', start_time: '2025-01-27T21:00:00Z' },
      { home_team: 'BOS', away_team: 'GSW', start_time: '2025-01-27T22:30:00Z' },
    ];

    for (const gameData of gamesData) {
      const homeTeam = teams.find(t => t.abbreviation === gameData.home_team);
      const awayTeam = teams.find(t => t.abbreviation === gameData.away_team);
      
      if (homeTeam && awayTeam) {
        await supabase.from('games').upsert({
          home_team_id: homeTeam.id,
          away_team_id: awayTeam.id,
          start_time: gameData.start_time,
          external_id: `game_${gameData.home_team}_vs_${gameData.away_team}_20250127`,
        }, { onConflict: 'external_id' });
      }
    }

    // Get the inserted data
    const { data: players } = await supabase.from('players').select('*');
    const { data: games } = await supabase.from('games').select('*');

    if (!players || !games) {
      console.error('Failed to fetch players or games');
      return;
    }

    // Sample props data using your exact scoring algorithm
    const propsData = [
      {
        player_name: 'Mikal Bridges',
        stat_type: 'Pts+Rebs+Asts',
        line_score: 25.5,
        h2h_array: [33, 35, 33, 41, 26, 17],
        l5_array: [12, 31, 26, 41, 28],
        odds_type: 'standard',
      },
      {
        player_name: 'Luka Doncic',
        stat_type: 'Rebounds',
        line_score: 9.5,
        h2h_array: [13, 12, 9, 10, 10, 6],
        l5_array: [7, 8, 12, 11, 11],
        odds_type: 'standard',
      },
      {
        player_name: 'Jimmy Butler',
        stat_type: 'Points',
        line_score: 22.5,
        h2h_array: [25, 28, 31, 19, 24, 27],
        l5_array: [28, 31, 24, 27, 22],
        odds_type: 'demon',
      },
      {
        player_name: 'Jayson Tatum',
        stat_type: 'Pts+Asts',
        line_score: 32.5,
        h2h_array: [38, 35, 40, 29, 34, 36],
        l5_array: [40, 34, 36, 31, 35],
        odds_type: 'goblin',
      },
    ];

    // Calculate stats for each prop using your algorithm
    for (const propData of propsData) {
      const player = players.find(p => p.display_name === propData.player_name);
      const game = games[Math.floor(Math.random() * games.length)]; // Assign to random game
      
      if (player && game) {
        const { h2h_array, l5_array, line_score } = propData;
        
        // Calculate averages
        const h2h_avg = h2h_array.reduce((a, b) => a + b, 0) / h2h_array.length;
        const l5_avg = l5_array.reduce((a, b) => a + b, 0) / l5_array.length;
        
        // Calculate scores (hits over line / total games)
        const h2h_score = h2h_array.filter(val => val > line_score).length / h2h_array.length;
        const l5_score = l5_array.filter(val => val > line_score).length / l5_array.length;
        
        // Calculate your exact scoring algorithm
        const h2h_weight = 0.45;
        const h2h_relative_diff_weight = 0.20;
        const sample_size_weight = 0.20;
        const l5_weight = 0.10;
        const l5_relative_diff_weight = 0.05;
        
        const h2h_relative_diff = (h2h_avg - line_score) / line_score;
        const l5_relative_diff = (l5_avg - line_score) / line_score;
        const sample_size = h2h_array.length;
        
        // Normalize sample size (assuming max of 10 games)
        const normalized_sample_size = Math.min(sample_size / 10, 1);
        
        const sorting_score = 
          (h2h_score * h2h_weight) +
          (Math.max(0, h2h_relative_diff) * h2h_relative_diff_weight) +
          (normalized_sample_size * sample_size_weight) +
          (l5_score * l5_weight) +
          (Math.max(0, l5_relative_diff) * l5_relative_diff_weight);

        await supabase.from('props').upsert({
          player_id: player.id,
          game_id: game.id,
          stat_type: propData.stat_type,
          line_score: propData.line_score,
          odds_type: propData.odds_type,
          h2h_array: propData.h2h_array,
          l5_array: propData.l5_array,
          h2h_avg: Math.round(h2h_avg * 100) / 100,
          l5_avg: Math.round(l5_avg * 100) / 100,
          h2h_score: Math.round(h2h_score * 1000) / 1000,
          l5_score: Math.round(l5_score * 1000) / 1000,
          sample_size: sample_size,
          sorting_score: Math.round(sorting_score * 1000) / 1000,
          external_id: `prop_${player.id}_${propData.stat_type.replace(/\+/g, '_')}_${Date.now()}`,
        }, { onConflict: 'external_id' });
      }
    }

    return true;
  } catch (error) {
    console.error('Error seeding sample data:', error);
    return false;
  }
};
