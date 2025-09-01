#!/usr/bin/env python3
"""
Test script to demonstrate the new rate limiting and debugging features
"""

from enhanced_main import EnhancedPropsProcessor
from prop import Prop
import time
import pandas as pd

def create_sample_props(league_id, count=5):
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

def create_sample_norm_data(league_id, count=8):
    """Create sample norm data for testing"""
    norm_data = []
    for i in range(count):
        norm_data.append({
            'Name': f"Test Player {i+1}",
            'StatType': 'Points' if league_id == 7 else 'Passing Yards',
            'lineScore': 20.5 + i,
            'OddType': 'standard',
            'TeamName': f"Test Team {i+1}",
            'GameID': f"game_{i+1}",
            'Team Name': f"Test Team {i+1}",
            'Position': 'PG' if league_id == 7 else 'QB',
            'StartTime': '2025-01-01T00:00:00Z'
        })
    
    return pd.DataFrame(norm_data)

def test_rate_limiting_features():
    print("🧪 Testing Rate Limiting and Debugging Features")
    print("=" * 60)
    
    # Create processor
    processor = EnhancedPropsProcessor()
    
    # Test NBA processing with rate limiting
    print("\n🏀 Testing NBA Processing with Enhanced Rate Limiting:")
    nba_props = create_sample_props(7, 3)  # Only 3 props to test
    nba_norm = create_sample_norm_data(7, 5)  # 5 rows in norm data
    
    print(f"Created {len(nba_props)} sample NBA props")
    print(f"Created norm data with {len(nba_norm)} rows")
    
    # Test the new methods
    print("\n🔧 Testing New Methods:")
    
    # Test optimal request interval
    optimal_interval = processor.get_optimal_request_interval(7)
    print(f"Optimal interval for NBA: {optimal_interval}s")
    
    # Test rate limiting adjustment
    test_success_rates = [95, 75, 50]
    current_interval = 2.0
    for rate in test_success_rates:
        new_interval = processor.adjust_rate_limiting(rate, current_interval)
        print(f"Success rate {rate}%: {current_interval}s -> {new_interval}s")
        current_interval = new_interval
    
    # Test stats validation
    print("\n🔍 Testing Stats Validation:")
    test_results = [
        None,
        [],
        [1, 2, 3],
        [None, '', 0],
        0,
        15.5,
        "invalid"
    ]
    
    for result in test_results:
        is_valid = processor.validate_stats_result(result, f"Test result: {result}")
        print(f"  {result} -> {'✅ Valid' if is_valid else '❌ Invalid'}")
    
    print("\n✅ Rate limiting features test completed!")

def test_stats_fetching_with_retry():
    print("\n🔄 Testing Stats Fetching with Retry Logic:")
    print("=" * 60)
    
    processor = EnhancedPropsProcessor()
    
    # Test the fetch_stats_with_retry method
    print("Testing fetch_stats_with_retry method...")
    
    # Create a mock stats function that fails first, then succeeds
    call_count = 0
    def mock_stats_function():
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise Exception("Mock failure on first attempt")
        elif call_count == 2:
            return []  # Empty list (will fail validation)
        else:
            return [10, 15, 20, 25, 30]  # Valid data
    
    print("Testing with mock function that fails then succeeds...")
    result = processor.fetch_stats_with_retry(
        mock_stats_function,
        "Mock stats test",
        max_retries=3,
        base_delay=1
    )
    
    if result:
        print(f"✅ Successfully got result: {result}")
    else:
        print("❌ Failed to get result after retries")
    
    print(f"Function was called {call_count} times")

def test_comprehensive_processing():
    print("\n🚀 Testing Comprehensive Processing with All Features:")
    print("=" * 60)
    
    processor = EnhancedPropsProcessor()
    
    # Test with a small dataset to see all features in action
    print("Creating small test dataset...")
    nba_props = create_sample_props(7, 2)
    nba_norm = create_sample_norm_data(7, 3)
    
    print(f"Props: {len(nba_props)}, Norm data: {len(nba_norm)}")
    
    # Test pre-filtering
    print("\n🔍 Testing pre-filtering...")
    try:
        filtered_props = processor.pre_filter_props_for_processing(nba_props, 7, nba_norm)
        print(f"Pre-filtering result: {len(filtered_props)} props")
    except Exception as e:
        print(f"Pre-filtering failed: {e}")
    
    # Test NBA processing (this will show rate limiting in action)
    print("\n🏀 Testing NBA processing with rate limiting...")
    try:
        # This will show the new rate limiting and debugging features
        processor.nba_processing(0, "since-2023-2024-season", nba_props, nba_norm)
        print("✅ NBA processing completed!")
    except Exception as e:
        print(f"❌ NBA processing failed: {e}")
        import traceback
        traceback.print_exc()

def main():
    print("🧪 Comprehensive Rate Limiting and Debugging Test Suite")
    print("=" * 70)
    
    try:
        # Test 1: Basic rate limiting features
        test_rate_limiting_features()
        
        # Test 2: Stats fetching with retry
        test_stats_fetching_with_retry()
        
        # Test 3: Comprehensive processing
        test_comprehensive_processing()
        
        print("\n🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test suite failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
