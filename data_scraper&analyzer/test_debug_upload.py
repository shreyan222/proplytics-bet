import requests
import json
from datetime import datetime, timedelta
import time

class TestSupabaseUploader:
    def __init__(self, supabase_url: str = "https://tlpzzneewikrpqfqygxi.supabase.co"):
        self.base_url = supabase_url
        self.ingestion_endpoint = f"{self.base_url}/functions/v1/python-data-ingestion"
        
    def create_test_props(self):
        """Create temporary test props for debugging"""
        test_props = []
        
        # Create 5 test NBA props
        for i in range(5):
            prop = {
                'player_name': f'Test Player {i+1}',
                'position': 'PG' if i % 2 == 0 else 'SG',
                'stat_type': 'Points' if i % 2 == 0 else 'Rebounds',
                'line_score': 15.5 + i,
                'odds_type': 'standard',
                'team_name': 'LAL' if i % 2 == 0 else 'BOS',
                'league_id': 7,  # NBA
                'game_id': f'test_game_{i+1}',
                'against_team': 'BOS' if i % 2 == 0 else 'LAL',
                'start_time': (datetime.now() + timedelta(hours=i+1)).isoformat(),
                'h2h_array': [18, 22, 19, 21, 20],
                'l5_array': [17, 19, 18, 20, 21],
                'h2h_avg': 20.0,
                'l5_avg': 18.8,
                'h2h_score': 0.8,
                'l5_score': 0.75,
                'sample_size': 5,
                'sorting_score': 0.85 + (i * 0.02),
                'league': 'NBA'
            }
            test_props.append(prop)
        
        # Create 5 test NFL props
        for i in range(5):
            prop = {
                'player_name': f'Test NFL Player {i+1}',
                'position': 'QB' if i % 2 == 0 else 'RB',
                'stat_type': 'Passing Yards' if i % 2 == 0 else 'Rushing Yards',
                'line_score': 250 + (i * 25),
                'odds_type': 'goblin' if i % 2 == 0 else 'demon',
                'team_name': 'KC' if i % 2 == 0 else 'NE',
                'league_id': 9,  # NFL
                'game_id': f'test_nfl_game_{i+1}',
                'against_team': 'NE' if i % 2 == 0 else 'KC',
                'start_time': (datetime.now() + timedelta(hours=i+2)).isoformat(),
                'h2h_array': [275, 290, 265, 280, 285],
                'l5_array': [270, 285, 260, 275, 280],
                'h2h_avg': 279.0,
                'l5_avg': 274.0,
                'h2h_score': 0.9,
                'l5_score': 0.8,
                'sample_size': 5,
                'sorting_score': 0.88 + (i * 0.02),
                'league': 'NFL'
            }
            test_props.append(prop)
        
        return test_props
    
    def upload_test_props(self, test_props, metadata=None):
        """Upload test props to Supabase"""
        try:
            payload = {
                'job_type': 'prizepicks_scrape',
                'props': test_props,
                'metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'total_props': len(test_props),
                    'script_version': 'test_debug_1.0',
                    'test_run': True,
                    **(metadata or {})
                }
            }
            
            print("\n📦 Test Payload being sent to Supabase:")
            print(f"   Job Type: {payload['job_type']}")
            print(f"   Props Count: {len(payload['props'])}")
            print(f"   First Prop: {payload['props'][0]['player_name']} - {payload['props'][0]['stat_type']}")
            print(f"   Metadata: {payload['metadata']}")
            
            print(f"\n🚀 Uploading {len(test_props)} test props to Supabase...")
            
            response = requests.post(
                self.ingestion_endpoint,
                json=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRscHp6bmVld2lrcnBxZnF5Z3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMjY4MTQsImV4cCI6MjA2MzkwMjgxNH0.hcW3ra_vsrA2eMPCe3LWFrGbuuhC_oadxXsS0bFDAg0'
                },
                timeout=300
            )
            
            print(f"📡 Response Status: {response.status_code}")
            print(f"📡 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Upload successful!")
                print(f"   Job ID: {result.get('job_id')}")
                print(f"   Success: {result.get('success')}")
                print(f"   Result: {result.get('result')}")
                return True
            else:
                print(f"❌ HTTP Error {response.status_code}")
                print(f"   Response Text: {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            print("❌ Upload timed out after 5 minutes")
            return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error: {e}")
            return False
        except Exception as e:
            print(f"❌ Unexpected error during upload: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def test_upload_with_retry(self, max_retries: int = 3):
        """Test upload with retry logic"""
        test_props = self.create_test_props()
        
        print(f"🧪 Created {len(test_props)} test props:")
        for i, prop in enumerate(test_props[:3]):  # Show first 3
            print(f"   {i+1}. {prop['player_name']} - {prop['stat_type']} over {prop['line_score']} ({prop['league']})")
        
        for attempt in range(max_retries):
            print(f"\n🔄 Upload attempt {attempt + 1}/{max_retries}")
            
            if self.upload_test_props(test_props, metadata={
                'attempt': attempt + 1,
                'test_description': 'Debug test upload with temporary data'
            }):
                return True
            
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                print(f"⏳ Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
        
        print(f"❌ Failed to upload after {max_retries} attempts")
        return False

def main():
    """Main test function"""
    print("🧪 Starting Supabase Upload Debug Test")
    print("=" * 50)
    
    uploader = TestSupabaseUploader()
    
    print("🔧 Testing Supabase connection and upload...")
    success = uploader.test_upload_with_retry()
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("✅ Your Supabase Edge Function is working")
        print("✅ Database tables are accessible")
        print("✅ Props can be uploaded")
    else:
        print("\n❌ Test failed!")
        print("🔍 Check your Edge Function logs for errors")
        print("🔍 Verify your database table structure")
        print("🔍 Check your Supabase configuration")

if __name__ == "__main__":
    main()
