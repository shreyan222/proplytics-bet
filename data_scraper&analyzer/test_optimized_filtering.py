#!/usr/bin/env python3
"""
Test script to demonstrate the new optimized pre-filtering system
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

def test_optimized_filtering():
    print("🧪 Testing Optimized Pre-Filtering System")
    print("=" * 60)
    
    # Create processor
    processor = EnhancedPropsProcessor()
    
    # Test with NBA props
    print("\n🏀 Testing NBA Pre-Filtering:")
    nba_props = create_sample_props(7, 15)
    print(f"Created {len(nba_props)} sample NBA props")
    
    # Test pre-filtering
    start_time = time.time()
    new_nba_props = processor.pre_filter_props_for_processing(nba_props, 7, None)
    nba_time = time.time() - start_time
    
    print(f"⏱️ NBA filtering took: {nba_time:.3f} seconds")
    print(f"📊 Results: {len(new_nba_props)} new, {len(nba_props) - len(new_nba_props)} existing")
    
    # Test with NFL props
    print("\n🏈 Testing NFL Pre-Filtering:")
    nfl_props = create_sample_props(9, 12)
    print(f"Created {len(nfl_props)} sample NFL props")
    
    # Test pre-filtering
    start_time = time.time()
    new_nfl_props = processor.pre_filter_props_for_processing(nfl_props, 9, None)
    nfl_time = time.time() - start_time
    
    print(f"⏱️ NFL filtering took: {nfl_time:.3f} seconds")
    print(f"📊 Results: {len(new_nfl_props)} new, {len(nfl_props) - len(new_nfl_props)} existing")
    
    # Show efficiency statistics
    print("\n📈 Efficiency Summary:")
    processor.show_processing_efficiency(len(nba_props), len(new_nba_props), "NBA")
    processor.show_processing_efficiency(len(nfl_props), len(new_nfl_props), "NFL")
    
    # Test cache status
    print("\n🗄️ Cache Status:")
    processor.show_cache_status()
    
    print("\n✅ Test completed!")

def test_performance_comparison():
    """Compare old vs new filtering performance"""
    print("\n⚡ Performance Comparison Test")
    print("=" * 40)
    
    processor = EnhancedPropsProcessor()
    
    # Create a larger dataset
    large_props = create_sample_props(7, 100)
    print(f"Testing with {len(large_props)} props...")
    
    # Test old method (if available)
    try:
        print("\n🔄 Testing old filtering method...")
        start_time = time.time()
        old_result = processor.filter_new_props(large_props, 7)
        old_time = time.time() - start_time
        print(f"⏱️ Old method took: {old_time:.3f} seconds")
    except:
        print("⚠️ Old method not available for comparison")
        old_time = None
    
    # Test new optimized method
    print("\n🚀 Testing new optimized method...")
    start_time = time.time()
    new_result = processor.pre_filter_props_for_processing(large_props, 7, None)
    new_time = time.time() - start_time
    print(f"⏱️ New method took: {new_time:.3f} seconds")
    
    if old_time:
        speedup = old_time / new_time if new_time > 0 else float('inf')
        print(f"🚀 Speed improvement: {speedup:.1f}x faster")
    
    print(f"📊 Results: {len(new_result)} new props found")

if __name__ == "__main__":
    test_optimized_filtering()
    test_performance_comparison()
