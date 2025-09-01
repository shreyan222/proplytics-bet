#!/usr/bin/env python3
"""
Test script to verify the filtering system is working correctly
"""

from enhanced_main import EnhancedPropsProcessor
import os

def main():
    print("🧪 Testing Enhanced Props Processor Filtering System")
    print("=" * 60)
    
    # Load environment variables
    if os.path.exists('.env'):
        print("📁 Loading .env file...")
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()
        print("✅ .env file loaded")
    
    # Create processor
    processor = EnhancedPropsProcessor()
    
    # Test NBA filtering
    print("\n🏀 Testing NBA filtering (league_id: 7)")
    processor.test_filtering_with_sample_data(7)
    
    # Test NFL filtering  
    print("\n🏈 Testing NFL filtering (league_id: 9)")
    processor.test_filtering_with_sample_data(9)
    
    # Test manual cache refresh
    print("\n🔄 Testing manual cache refresh for NBA")
    processor.force_cache_refresh(7)
    
    # Show final cache status
    print("\n📊 Final cache status:")
    processor.show_cache_status()
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    main()
