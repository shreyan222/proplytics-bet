#!/usr/bin/env python3
"""
Script to add matchup rankings to props before they are processed by enhanced_main.py
This can be run as a standalone script or imported as a module
"""

import pickle
from matchup_rankings_helper import assign_matchup_ranks_to_props

def add_matchup_rankings_to_props():
    """Add matchup rankings to all props in pickle files"""
    print("🎯 Adding Matchup Rankings to Props")
    print("=" * 40)
    
    # Process NBA props
    try:
        with open('nba_props.pkl', 'rb') as f:
            nba_props = pickle.load(f)
        
        print(f"📊 Loaded {len(nba_props)} NBA props")
        assign_matchup_ranks_to_props(nba_props, "NBA")  # Will assign default rank 16
        
        # Save back to file
        with open('nba_props.pkl', 'wb') as f:
            pickle.dump(nba_props, f)
        print("✅ Updated NBA props with matchup rankings")
        
    except FileNotFoundError:
        print("⚠️ nba_props.pkl not found, skipping NBA props")
    except Exception as e:
        print(f"❌ Error processing NBA props: {e}")
    
    # Process NFL props  
    try:
        with open('nfl_props.pkl', 'rb') as f:
            nfl_props = pickle.load(f)
        
        print(f"📊 Loaded {len(nfl_props)} NFL props")
        
        # First, we need to set against_team for props that don't have it
        # This is a simplified version - in enhanced_main.py this is done more comprehensively
        for prop in nfl_props:
            if not hasattr(prop, 'against_team') or not prop.against_team:
                prop.against_team = "Unknown"  # Will get default rank
        
        assign_matchup_ranks_to_props(nfl_props, "NFL")
        
        # Save back to file
        with open('nfl_props.pkl', 'wb') as f:
            pickle.dump(nfl_props, f)
        print("✅ Updated NFL props with matchup rankings")
        
    except FileNotFoundError:
        print("⚠️ nfl_props.pkl not found, skipping NFL props")
    except Exception as e:
        print(f"❌ Error processing NFL props: {e}")
    
    print("\n🎉 Matchup ranking assignment completed!")
    print("💡 Props now have 'matchup_rank' attribute that will be uploaded to Supabase")

def test_props_with_rankings():
    """Test that props now have matchup rankings"""
    print("\n🧪 Testing props with matchup rankings...")
    
    try:
        with open('nfl_props.pkl', 'rb') as f:
            nfl_props = pickle.load(f)
        
        print(f"📊 Testing first 5 NFL props:")
        for i, prop in enumerate(nfl_props[:5]):
            rank = getattr(prop, 'matchup_rank', 'NOT SET')
            against = getattr(prop, 'against_team', 'NOT SET')
            print(f"  {i+1}. {prop.player_name} - {prop.stat_type} vs {against} = Rank {rank}")
            
    except Exception as e:
        print(f"❌ Error testing props: {e}")

if __name__ == "__main__":
    add_matchup_rankings_to_props()
    test_props_with_rankings()
