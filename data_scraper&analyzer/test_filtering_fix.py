#!/usr/bin/env python3
"""
Test script to verify the filtering fix works correctly
"""

from enhanced_main import EnhancedPropsProcessor
from prop import Prop
import time

def create_sample_props(league_id, count=10):
    """Create sample props for testing"""
    props = []
    for i in range(count):
        prop = Prop(
            player_name=f"Test Player {i+1}",
            position="PG" if league_id == 7 else "QB",
            stat_type="Points" if league_id == 7 else "Passing Yards",
            line_score=20.5 + i,
            odds_type="standard",
            team_name=f"Test Team {i+1}",
            league_id=league_id,
            game_id=f"game_{i+1}"
        )
        props.append(prop)
    return props

def test_filtering_fix():
    print("🧪 Testing Filtering Fix")
    print("=" * 50)
    
    # Create processor
    processor = EnhancedPropsProcessor()
    
    # Test with NBA props
    print("\n🏀 Testing NBA Processing with Filtered Props:")
    nba_props = create_sample_props(7, 5)  # Only 5 props
    print(f"Created {len(nba_props)} sample NBA props")
    
    # Simulate norm data with more rows than props (like real scenario)
    import pandas as pd
    norm_data = []
    for i in range(10):  # 10 rows in norm data
        norm_data.append({
            'Name': f"Test Player {i+1}",
            'StatType': 'Points',
            'lineScore': 20.5 + i,
            'OddType': 'standard',
            'TeamName': f"Test Team {i+1}",
            'GameID': f"game_{i+1}",
            'Team Name': f"Test Team {i+1}",
            'StartTime': '2025-01-01T00:00:00Z'
        })
    
    # Add some rows that don't match our props (simulating existing props)
    for i in range(5, 10):
        norm_data.append({
            'Name': f"Existing Player {i+1}",
            'StatType': 'Rebounds',
            'lineScore': 5.5 + i,
            'OddType': 'goblin',
            'TeamName': f"Existing Team {i+1}",
            'GameID': f"game_{i+1}",
            'Team Name': f"Existing Team {i+1}",
            'StartTime': '2025-01-01T00:00:00Z'
        })
    
    norm_df = pd.DataFrame(norm_data)
    print(f"Created norm data with {len(norm_df)} rows")
    print(f"Norm data columns: {list(norm_df.columns)}")
    
    # Test pre-filtering
    print("\n🚀 Testing pre-filtering...")
    start_time = time.time()
    new_nba_props = processor.pre_filter_props_for_processing(nba_props, 7, norm_df)
    filtering_time = time.time() - start_time
    
    print(f"⏱️ Pre-filtering took: {filtering_time:.3f} seconds")
    print(f"📊 Results: {len(new_nba_props)} new, {len(nba_props) - len(new_nba_props)} existing")
    
    # Test NBA processing with filtered props
    print("\n🏀 Testing NBA processing with filtered props...")
    try:
        # This should only process the props that are in our filtered list
        processor.nba_processing(0, "since-2023-2024-season", new_nba_props, norm_df)
        print("✅ NBA processing completed successfully!")
    except Exception as e:
        print(f"❌ NBA processing failed: {e}")
        import traceback
        traceback.print_exc()
    
    # Test with NFL props
    print("\n🏈 Testing NFL Processing with Filtered Props:")
    nfl_props = create_sample_props(9, 3)  # Only 3 props
    print(f"Created {len(nfl_props)} sample NFL props")
    
    # Create NFL norm data
    nfl_norm_data = []
    for i in range(8):  # 8 rows in norm data
        if i < 3:
            # These should match our props
            nfl_norm_data.append({
                'Name': f"Test Player {i+1}",
                'StatType': 'Passing Yards',
                'lineScore': 200.5 + i*50,
                'OddType': 'standard',
                'TeamName': f"Test Team {i+1}",
                'GameID': f"game_{i+1}",
                'Team Name': f"Test Team {i+1}",
                'Position': 'QB',
                'StartTime': '2025-01-01T00:00:00Z'
            })
        else:
            # These should not match our props (simulating existing props)
            nfl_norm_data.append({
                'Name': f"Existing Player {i+1}",
                'StatType': 'Rushing Yards',
                'lineScore': 50.5 + i*10,
                'OddType': 'demon',
                'TeamName': f"Existing Team {i+1}",
                'GameID': f"game_{i+1}",
                'Team Name': f"Existing Team {i+1}",
                'Position': 'RB',
                'StartTime': '2025-01-01T00:00:00Z'
            })
    
    nfl_norm_df = pd.DataFrame(nfl_norm_data)
    print(f"Created NFL norm data with {len(nfl_norm_df)} rows")
    
    # Test NFL processing with filtered props
    print("\n🏈 Testing NFL processing with filtered props...")
    try:
        # This should only process the props that are in our filtered list
        processor.nfl_processing(0, nfl_norm_df, new_nfl_props)
        print("✅ NFL processing completed successfully!")
    except Exception as e:
        print(f"❌ NFL processing failed: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    test_filtering_fix()
