#!/usr/bin/env python3
"""
Helper module for NFL matchup rankings functionality
This module provides clean, reusable functions for matchup ranking
"""

import json

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
    """Get matchup rank for a specific prop
    
    Args:
        prop: Prop object with player, stat, team, and against_team info
        matchup_rankings: Dictionary of team rankings from NFL scraper
        
    Returns:
        Integer rank 1-32 (1 = best matchup, 32 = worst matchup)
    """
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
        return position_stats[mapped_stat]
    
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
                return position_stats[alt_stat]
    
    # Fallback to any available stat for this position
    if position_stats:
        return list(position_stats.values())[0]
    
    return 16  # Default middle rank

def assign_matchup_ranks_to_props(props, league_name=""):
    """Assign matchup ranks to all props based on their stat type and opponent
    
    Args:
        props: List of Prop objects
        league_name: "NFL" or "NBA" (only NFL supported currently)
    """
    if league_name != "NFL":
        print(f"⚠️ Matchup rankings only supported for NFL currently, skipping {league_name}")
        for prop in props:
            prop.matchup_rank = 16  # Default middle rank
        return
    
    # Load NFL matchup rankings
    matchup_rankings = load_nfl_matchup_rankings()
    
    if not matchup_rankings:
        print("⚠️ No matchup rankings available, assigning default ranks")
        for prop in props:
            prop.matchup_rank = 16
        return
    
    print(f"🎯 Assigning matchup ranks to {len(props)} {league_name} props...")
    
    rank_stats = {}
    for prop in props:
        rank = get_prop_matchup_rank(prop, matchup_rankings)
        prop.matchup_rank = rank
        
        # Track statistics
        if rank not in rank_stats:
            rank_stats[rank] = 0
        rank_stats[rank] += 1
    
    # Show statistics
    print(f"\n📊 {league_name} Matchup Rank Distribution:")
    great_matchups = sum(count for rank, count in rank_stats.items() if rank <= 8)
    good_matchups = sum(count for rank, count in rank_stats.items() if 9 <= rank <= 16)
    fair_matchups = sum(count for rank, count in rank_stats.items() if 17 <= rank <= 24)
    poor_matchups = sum(count for rank, count in rank_stats.items() if rank >= 25)
    
    print(f"   🟢 Great (1-8): {great_matchups} props")
    print(f"   🟡 Good (9-16): {good_matchups} props")
    print(f"   🟠 Fair (17-24): {fair_matchups} props")
    print(f"   🔴 Poor (25-32): {poor_matchups} props")
    
    print(f"✅ Assigned matchup ranks to all {league_name} props")
