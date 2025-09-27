#!/usr/bin/env python3
"""
Test upload script that uploads only the first 100 props to Supabase.
This is useful for testing the upload functionality without processing all props.
"""

import pickle
import time
from datetime import datetime
from supabase_uploader import SupabaseUploader
from enhanced_main import EnhancedPropsProcessor

def test_upload_first_100_props():
    """Upload only the first 100 props from each league for testing"""
    
    print("🧪 Starting test upload of first 100 props...")
    start_time = time.time()
    
    # Initialize the processor for field validation
    processor = EnhancedPropsProcessor()
    
    # Initialize uploader
    uploader = SupabaseUploader()
    
    if not uploader.enabled:
        print("❌ Supabase uploader is not enabled. Please check your credentials.")
        return False
    
    print("✅ Supabase uploader is ready")
    
    # Load props from pickle files
    nba_props = processor.load_props_from_file('nba_props.pkl')
    nfl_props = processor.load_props_from_file('nfl_props.pkl')
    
    print(f"📊 Loaded {len(nba_props)} NBA props and {len(nfl_props)} NFL props")
    
    # Take only first 100 props from each league
    test_nba_props = nba_props[:100] if len(nba_props) > 100 else nba_props
    test_nfl_props = nfl_props[:100] if len(nfl_props) > 100 else nfl_props
    
    print(f"🎯 Testing with {len(test_nba_props)} NBA props and {len(test_nfl_props)} NFL props")
    
    total_uploaded = 0
    
    # Upload NBA props if we have any
    if test_nba_props:
        print(f"\n🏀 Uploading {len(test_nba_props)} NBA test props...")
        
        # Ensure all props have required fields
        test_nba_props = processor.ensure_prop_fields(test_nba_props)
        
        # Upload NBA props
        nba_success = uploader.upload_with_retry(test_nba_props, metadata={
            'test_run': True,
            'league': 'NBA',
            'total_props': len(test_nba_props),
            'timestamp': datetime.now().isoformat(),
            'description': 'Test upload of first 100 NBA props'
        }, force_processing=True)
        
        if nba_success:
            total_uploaded += len(test_nba_props)
            print(f"✅ NBA props uploaded successfully")
        else:
            print(f"❌ NBA props upload failed")
    
    # Upload NFL props if we have any
    if test_nfl_props:
        print(f"\n🏈 Uploading {len(test_nfl_props)} NFL test props...")
        
        # Ensure all props have required fields
        test_nfl_props = processor.ensure_prop_fields(test_nfl_props)
        
        # Upload NFL props
        nfl_success = uploader.upload_with_retry(test_nfl_props, metadata={
            'test_run': True,
            'league': 'NFL',
            'total_props': len(test_nfl_props),
            'timestamp': datetime.now().isoformat(),
            'description': 'Test upload of first 100 NFL props'
        }, force_processing=True)
        
        if nfl_success:
            total_uploaded += len(test_nfl_props)
            print(f"✅ NFL props uploaded successfully")
        else:
            print(f"❌ NFL props upload failed")
    
    # Summary
    end_time = time.time()
    elapsed_time = end_time - start_time
    
    print(f"\n📊 Test Upload Summary:")
    print(f"   Total props uploaded: {total_uploaded}")
    print(f"   NBA props: {len(test_nba_props) if test_nba_props else 0}")
    print(f"   NFL props: {len(test_nfl_props) if test_nfl_props else 0}")
    print(f"   Total time: {elapsed_time:.2f} seconds")
    
    if total_uploaded > 0:
        print(f"✅ Test upload completed successfully!")
        return True
    else:
        print(f"❌ Test upload failed - no props were uploaded")
        return False

def test_upload_specific_league(league='NBA', limit=100):
    """Upload first N props from a specific league"""
    
    print(f"🧪 Testing upload of first {limit} {league} props...")
    start_time = time.time()
    
    # Initialize the processor for field validation
    processor = EnhancedPropsProcessor()
    
    # Initialize uploader
    uploader = SupabaseUploader()
    
    if not uploader.enabled:
        print("❌ Supabase uploader is not enabled. Please check your credentials.")
        return False
    
    # Load props from pickle file
    if league.upper() == 'NBA':
        props = processor.load_props_from_file('nba_props.pkl')
        league_id = 7
    elif league.upper() == 'NFL':
        props = processor.load_props_from_file('nfl_props.pkl')
        league_id = 9
    else:
        print(f"❌ Unknown league: {league}. Use 'NBA' or 'NFL'")
        return False
    
    print(f"📊 Loaded {len(props)} {league} props")
    
    # Take only first N props
    test_props = props[:limit] if len(props) > limit else props
    
    print(f"🎯 Testing with {len(test_props)} {league} props")
    
    # Ensure all props have required fields
    test_props = processor.ensure_prop_fields(test_props)
    
    # Upload props
    success = uploader.upload_with_retry(test_props, metadata={
        'test_run': True,
        'league': league,
        'total_props': len(test_props),
        'timestamp': datetime.now().isoformat(),
        'description': f'Test upload of first {len(test_props)} {league} props'
    }, force_processing=True)
    
    # Summary
    end_time = time.time()
    elapsed_time = end_time - start_time
    
    print(f"\n📊 Test Upload Summary:")
    print(f"   League: {league}")
    print(f"   Props uploaded: {len(test_props) if success else 0}")
    print(f"   Total time: {elapsed_time:.2f} seconds")
    
    if success:
        print(f"✅ {league} test upload completed successfully!")
        return True
    else:
        print(f"❌ {league} test upload failed")
        return False

def show_prop_samples(league='NBA', count=5):
    """Show sample props from the pickle file"""
    
    print(f"📋 Sample {league} props from pickle file:")
    
    # Initialize the processor
    processor = EnhancedPropsProcessor()
    
    # Load props from pickle file
    if league.upper() == 'NBA':
        props = processor.load_props_from_file('nba_props.pkl')
    elif league.upper() == 'NFL':
        props = processor.load_props_from_file('nfl_props.pkl')
    else:
        print(f"❌ Unknown league: {league}. Use 'NBA' or 'NFL'")
        return
    
    if not props:
        print(f"❌ No {league} props found in pickle file")
        return
    
    print(f"Total {league} props: {len(props)}")
    
    # Check for empty player names
    empty_names = 0
    for prop in props:
        if not hasattr(prop, 'player_name') or not prop.player_name or str(prop.player_name).strip() == '':
            empty_names += 1
    
    if empty_names > 0:
        print(f"⚠️ Warning: Found {empty_names} props with empty player names!")
    
    print(f"Showing first {min(count, len(props))} props:")
    print("-" * 80)
    
    for i, prop in enumerate(props[:count]):
        player_name = getattr(prop, 'player_name', 'MISSING')
        print(f"Prop {i+1}:")
        print(f"  Player: '{player_name}' (type: {type(player_name)})")
        print(f"  Stat: {getattr(prop, 'stat_type', 'MISSING')}")
        print(f"  Line: {getattr(prop, 'line_score', 'MISSING')}")
        print(f"  Odds: {getattr(prop, 'odds_type', 'MISSING')}")
        print(f"  Team: {getattr(prop, 'team_name', 'MISSING')}")
        print(f"  League ID: {getattr(prop, 'league_id', 'MISSING')}")
        print(f"  Against Team: {getattr(prop, 'against_team', 'Not set')}")
        print(f"  Start Time: {getattr(prop, 'start_time', 'Not set')}")
        print(f"  Game ID: {getattr(prop, 'game_id', 'Not set')}")
        print("-" * 80)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'nba':
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 100
            test_upload_specific_league('NBA', limit)
        elif command == 'nfl':
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 100
            test_upload_specific_league('NFL', limit)
        elif command == 'sample':
            league = sys.argv[2] if len(sys.argv) > 2 else 'NBA'
            count = int(sys.argv[3]) if len(sys.argv) > 3 else 5
            show_prop_samples(league, count)
        else:
            print("Usage:")
            print("  python test_upload.py                    # Upload first 100 props from both leagues")
            print("  python test_upload.py nba [limit]        # Upload first N NBA props (default 100)")
            print("  python test_upload.py nfl [limit]        # Upload first N NFL props (default 100)")
            print("  python test_upload.py sample [league] [count]  # Show sample props (default NBA, 5)")
    else:
        # Default: upload first 100 props from both leagues
        test_upload_first_100_props()
