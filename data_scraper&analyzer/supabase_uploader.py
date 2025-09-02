
import requests
import json
from datetime import datetime
import time
from typing import List, Dict, Any
from prop import Prop
import os

class SupabaseUploader:
    def __init__(self):
        # Get Supabase credentials from environment variables
        self.supabase_url = os.environ.get('SUPABASE_URL')
        self.supabase_key = os.environ.get('SUPABASE_KEY', '')
        
        # Only construct endpoint if we have valid credentials
        if self.supabase_url and self.supabase_key:
            self.ingestion_endpoint = f"{self.supabase_url}/functions/v1/python-data-ingestion"
            self.enabled = True
        else:
            self.ingestion_endpoint = None
            print("Warning: SUPABASE_URL or SUPABASE_KEY environment variable not set. Supabase uploads will be disabled.")
            self.enabled = False
    
    def update_credentials(self, url: str, key: str):
        """Update credentials and endpoint after environment variables are loaded"""
        self.supabase_url = url
        self.supabase_key = key
        if self.supabase_url and self.supabase_key:
            self.ingestion_endpoint = f"{self.supabase_url}/functions/v1/python-data-ingestion"
            self.enabled = True
            print(f"✅ Supabase uploader enabled with URL: {self.supabase_url}")
        else:
            self.ingestion_endpoint = None
            self.enabled = False
            print("❌ Supabase uploader disabled - invalid credentials")
    
    def is_configured(self) -> bool:
        """Check if the uploader is properly configured"""
        return (
            self.enabled and 
            self.ingestion_endpoint and 
            self.supabase_url and 
            self.supabase_key
        )
    
    def reload_from_environment(self):
        """Reload credentials from environment variables"""
        env_url = os.environ.get('SUPABASE_URL')
        env_key = os.environ.get('SUPABASE_KEY')
        
        if env_url and env_key:
            self.update_credentials(env_url, env_key)
            return True
        else:
            print("❌ No credentials found in environment variables")
            return False
        
    def convert_prop_to_dict(self, prop: Prop) -> Dict[str, Any]:
        print(f"Player: {prop.player_name}, league_id: {prop.league_id}, assigned league: {'NFL' if prop.league_id == 9 else 'NBA'}")
        
        # Safe division for averages
        h2h_array = getattr(prop, 'H2H1Y', [])
        l5_array = getattr(prop, 'L5', [])
        
        h2h_avg = sum(h2h_array) / len(h2h_array) if h2h_array else 0
        l5_avg = sum(l5_array) / len(l5_array) if l5_array else 0
        
        return {
            'player_name': prop.player_name,
            'position': prop.position,
            'stat_type': prop.stat_type,
            'line_score': float(prop.line_score),
            'odds_type': prop.odds_type,
            'team_name': prop.team_name,
            'league_id': prop.league_id,  # ✅ Add this field
            'game_id': prop.game_id,
            'against_team': getattr(prop, 'against_team', None),
            'start_time': getattr(prop, 'start_time', None),
            'h2h_array': h2h_array,
            'l5_array': l5_array,
            'h2h_avg': h2h_avg,
            'l5_avg': l5_avg,
            'h2h_score': 0,
            'l5_score': 0,
            'sample_size': len(h2h_array),
            'sorting_score': getattr(prop, 'score', 0),
            'league': 'NBA' if prop.league_id == 7 else 'NFL'
        }

    
    def upload_props(self, props: List[Prop], metadata: Dict[str, Any] = None, force_processing: bool = False) -> bool:
        """Upload props data to Supabase"""
        if not self.is_configured():
            print("❌ Supabase uploader not properly configured. Cannot upload.")
            print(f"  Enabled: {self.enabled}")
            print(f"  Endpoint: {self.ingestion_endpoint}")
            print(f"  URL: {self.supabase_url}")
            print(f"  Key: {'***' + self.supabase_key[-4:] if self.supabase_key else 'None'}")
            return False

        try:
            # Convert props to dictionaries
            props_data = []
            for prop in props:
                prop_dict = self.convert_prop_to_dict(prop)
                
                # Calculate averages
                if prop_dict['h2h_array']:
                    prop_dict['h2h_avg'] = sum(prop_dict['h2h_array']) / len(prop_dict['h2h_array'])
                if prop_dict['l5_array']:
                    prop_dict['l5_avg'] = sum(prop_dict['l5_array']) / len(prop_dict['l5_array'])
                
                props_data.append(prop_dict)
            
            print(f"📦 Uploading {len(props_data)} props")
            
            payload = {
                'job_type': 'prizepicks_scrape',
                'props': props_data,
                'metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'total_props': len(props_data),
                    'script_version': '1.0',
                    'force_processing': force_processing,
                    **(metadata or {})
                }
            }
            
            print("\n📦 Payload being sent to Supabase (first prop):")
            if props_data:
                print(json.dumps(props_data[0], indent=2))
            print("\n📦 Metadata:")
            print(json.dumps(payload['metadata'], indent=2))
            
            response = requests.post(
                self.ingestion_endpoint,
                json=payload,
                headers={
                    'Content-Type': 'application/json',
                    'apikey': self.supabase_key,
                    'Authorization': f'Bearer {self.supabase_key}'
                },
                timeout=300  # 5 minute timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    batch_result = result.get('result', {})
                    props_processed = batch_result.get('props_processed', 0)
                    print(f"✅ Upload completed: {props_processed} props processed")
                    print(f"   Job ID: {result.get('job_id')}")
                    return True
                else:
                    print(f"❌ Upload failed: {result.get('error')}")
                    return False
            else:
                print(f"❌ HTTP Error {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            print("Upload timed out after 5 minutes")
            return False
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            return False
        except Exception as e:
            print(f"Unexpected error during upload: {e}")
            return False
    
    def upload_with_retry(self, props: List[Prop], max_retries: int = 3, metadata: Dict[str, Any] = None, force_processing: bool = False) -> bool:
        for i, prop in enumerate(props):
            for field in ['game_id', 'against_team', 'start_time']:
                if not hasattr(prop, field) or getattr(prop, field) in [None, '', 'Unknown']:
                    print(f"❌ Prop #{i} missing {field}: {prop.player_name} ({prop.stat_type})")

        """Upload props with retry logic"""
        for attempt in range(max_retries):
            print(f"Upload attempt {attempt + 1}/{max_retries}")
            
            if self.upload_props(props, metadata, force_processing):
                return True
            
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
        
        print(f"Failed to upload after {max_retries} attempts")
        return False

# Integration with your existing main script
def integrate_with_main():
    """Example of how to integrate with your existing Main.py"""
    from enhanced_main import load_props_from_file
    
    # Load props from your existing pickle file
    props = load_props_from_file('nba_props.pkl')
    
    if props:
        uploader = SupabaseUploader()
        
        # Now we can safely use uploader
        print(uploader.convert_prop_to_dict(props[0]))
        print(f"against_team: {props[0].against_team}, start_time: {props[0].start_time}")
        
        success = uploader.upload_with_retry(props, metadata={
            'source': 'main_script',
            'nba_props_count': len(props)
        })
        
        if success:
            print("Props successfully uploaded to Supabase!")
        else:
            print("Failed to upload props to Supabase")
            print(uploader.convert_prop_to_dict(props[0]))
            print(f"against_team: {props[0].against_team}, start_time: {props[0].start_time}")
    else:
        print("No props found to upload")

if __name__ == "__main__":
    integrate_with_main()
