#!/usr/bin/env python3
"""
Test script to demonstrate NFL matchup ranking functionality
"""

import json
from prop import Prop

def load_nfl_matchup_rankings():
    """Load NFL matchup rankings from generated file"""
    try:
        with open('nfl_generated_matchup_rankings.json', 'r') as f:
            data = json.load(f)
        print(f"✅ Loaded NFL matchup rankings for {len(data['team_rankings'])} teams")
        return data['team_rankings']
    except FileNotFoundError:
        print("⚠️ NFL matchup rankings not found. Run generate_nfl_rankings.py first.")
        return {}
    except Exception as e:
        print(f"❌ Error loading NFL matchup rankings: {e}")
        return {}

def get_prop_matchup_rank(prop, matchup_rankings):
    """Get matchup rank for a specific prop"""
    if not matchup_rankings or not hasattr(prop, 'against_team') or not prop.against_team:
        return 16  # Default middle rank
    
    team_name = prop.against_team
    position = getattr(prop, 'position', 'Unknown')
    stat_type = prop.stat_type
    
    # Handle "Unknown" or combo teams
    if team_name == "Unknown" or "/" in team_name:
        return 16  # Default middle rank
    
    # Check if team exists in rankings
    if team_name not in matchup_rankings:
        print(f"⚠️ Team '{team_name}' not found in matchup rankings")
        return 16
    
    team_data = matchup_rankings[team_name]
    
    # Map positions for NFL
    position_mapping = {
        'QB': 'QB',
        'RB': 'RB', 
        'WR': 'WR',
        'TE': 'TE',
        'K': 'K',
        'DEF': 'DEF'
    }
    
    mapped_position = position_mapping.get(position, 'RB')  # Default to RB if unknown
    
    # Check if position exists in team data
    if mapped_position not in team_data:
        print(f"⚠️ Position '{mapped_position}' not found for team '{team_name}'")
        return 16
    
    position_stats = team_data[mapped_position]
    
    # Map stat types to ranking categories
    stat_mapping = {
        # Rushing stats
        'Rush Yards': 'Rush Yards',
        'Rushing Yards': 'Rush Yards', 
        'Rush Attempts': 'Rush Attempts',
        'Rush TDs': 'Rush TDs',
        'Rushing TDs': 'Rush TDs',
        
        # Receiving stats
        'Receiving Yards': 'Receiving Yards',
        'Rec Yards': 'Receiving Yards',
        'Receptions': 'Receptions',
        'Rec TDs': 'Rec TDs',
        'Receiving TDs': 'Rec TDs',
        
        # Passing stats
        'Passing Yards': 'Passing Yards',
        'Pass Yards': 'Passing Yards',
        'Pass TDs': 'Pass TDs',
        'Passing TDs': 'Pass TDs',
        'Pass Completions': 'Pass Completions',
        'Pass Attempts': 'Pass Attempts'
    }
    
    # Try to find the stat in position data
    mapped_stat = stat_mapping.get(stat_type, stat_type)
    
    # Try exact match first
    if mapped_stat in position_stats:
        rank = position_stats[mapped_stat]
        print(f"📊 Matchup rank for {prop.player_name} ({mapped_position}) vs {team_name} - {mapped_stat}: {rank}/32")
        return rank
    
    # Try alternative lookups
    alternatives = {
        'Rush Yards': ['Rushing Yards', 'Rush Attempts'],
        'Rushing Yards': ['Rush Yards', 'Rush Attempts'],
        'Rec Yards': ['Receiving Yards', 'Receptions'],
        'Receiving Yards': ['Rec Yards', 'Receptions'],
        'Pass TDs': ['Passing TDs', 'Passing Yards'],
        'Rush TDs': ['Rushing TDs', 'Rush Yards'],
        'Rec TDs': ['Receiving TDs', 'Receiving Yards']
    }
    
    if mapped_stat in alternatives:
        for alt_stat in alternatives[mapped_stat]:
            if alt_stat in position_stats:
                rank = position_stats[alt_stat]
                print(f"📊 Matchup rank for {prop.player_name} ({mapped_position}) vs {team_name} - {alt_stat} (alt for {mapped_stat}): {rank}/32")
                return rank
    
    # Fallback to any available stat for this position
    if position_stats:
        fallback_stat = list(position_stats.keys())[0]
        rank = position_stats[fallback_stat]
        print(f"📊 Fallback matchup rank for {prop.player_name} ({mapped_position}) vs {team_name} - using {fallback_stat}: {rank}/32")
        return rank
    
    print(f"⚠️ No matchup rank found for {prop.player_name} ({mapped_position}) vs {team_name} - {stat_type}, using default")
    return 16  # Default middle rank

def test_matchup_rankings():
    """Test the matchup ranking system with sample props"""
    print("🏈 Testing NFL Matchup Rankings System")
    print("=" * 50)
    
    # Load matchup rankings
    matchup_rankings = load_nfl_matchup_rankings()
    
    if not matchup_rankings:
        print("❌ No matchup rankings available for testing")
        return
    
    # Create sample props for testing
    test_props = [
        # Isaiah Pacheco vs Giants (should be good matchup for RB rushing)
        Prop(
            player_name="Isaiah Pacheco",
            position="RB", 
            stat_type="Rush Yards",
            line_score=65.5,
            odds_type="standard",
            team_name="Kansas City Chiefs",
            league_id="9",
            game_id="test1"
        ),
        
        # Travis Kelce vs Giants (TE receiving)
        Prop(
            player_name="Travis Kelce",
            position="TE",
            stat_type="Receiving Yards", 
            line_score=45.5,
            odds_type="standard",
            team_name="Kansas City Chiefs",
            league_id="9",
            game_id="test1"
        ),
        
        # Josh Allen vs Dolphins (QB passing)
        Prop(
            player_name="Josh Allen",
            position="QB",
            stat_type="Passing Yards",
            line_score=275.5,
            odds_type="standard", 
            team_name="Buffalo Bills",
            league_id="9",
            game_id="test2"
        ),
        
        # Saquon Barkley vs Raiders (should be great matchup)
        Prop(
            player_name="Saquon Barkley",
            position="RB",
            stat_type="Rush Yards",
            line_score=85.5,
            odds_type="goblin",
            team_name="New York Giants", 
            league_id="9",
            game_id="test3"
        )
    ]
    
    # Set against_team for each prop (simulate what enhanced_main.py does)
    test_props[0].against_team = "New York Giants"  # Chiefs vs Giants
    test_props[1].against_team = "New York Giants"  # Chiefs vs Giants  
    test_props[2].against_team = "Miami Dolphins"   # Bills vs Dolphins
    test_props[3].against_team = "Las Vegas Raiders" # Giants vs Raiders
    
    print(f"\n🧪 Testing {len(test_props)} sample props:")
    print("-" * 50)
    
    for i, prop in enumerate(test_props, 1):
        print(f"\n{i}. {prop.player_name} ({prop.position}) - {prop.stat_type} {prop.line_score}")
        print(f"   Team: {prop.team_name} vs {prop.against_team}")
        
        # Get matchup rank
        rank = get_prop_matchup_rank(prop, matchup_rankings)
        prop.matchup_rank = rank
        
        # Interpret the ranking
        if rank <= 8:
            quality = "🟢 Great matchup"
        elif rank <= 16:
            quality = "🟡 Good matchup"
        elif rank <= 24:
            quality = "🟠 Fair matchup"
        else:
            quality = "🔴 Poor matchup"
        
        print(f"   Matchup Rank: {rank}/32 ({quality})")
    
    print(f"\n✅ Matchup ranking test completed!")
    print(f"💡 These ranks would be uploaded to Supabase in the 'matchup_rank' field")

if __name__ == "__main__":
    test_matchup_rankings()
