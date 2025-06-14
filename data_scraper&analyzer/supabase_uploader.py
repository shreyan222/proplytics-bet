
import requests
import json
from datetime import datetime
import time
from typing import List, Dict, Any
from prop import Prop

class SupabaseUploader:
    def __init__(self, supabase_url: str = "https://tlpzzneewikrpqfqygxi.supabase.co"):
        self.base_url = supabase_url
        self.ingestion_endpoint = f"{self.base_url}/functions/v1/python-data-ingestion"
        
    def convert_prop_to_dict(self, prop: Prop) -> Dict[str, Any]:
        """Convert a Prop object to a dictionary for JSON serialization"""
        return {
            'player_name': prop.player_name,
            'position': prop.position,
            'stat_type': prop.stat_type,
            'line_score': float(prop.line_score),
            'odds_type': prop.odds_type,
            'team_name': prop.team_name,
            'league_id': prop.league_id,
            'game_id': prop.game_id,
            'h2h_array': prop.H2H1Y if hasattr(prop, 'H2H1Y') else [],
            'l5_array': prop.L5 if hasattr(prop, 'L5') else [],
            'h2h_avg': 0,  # Will be calculated
            'l5_avg': 0,   # Will be calculated
            'h2h_score': 0,  # Will be calculated
            'l5_score': 0,   # Will be calculated
            'sample_size': len(prop.H2H1Y) if hasattr(prop, 'H2H1Y') else 0,
            'sorting_score': prop.score if hasattr(prop, 'score') else 0
        }
    
    def upload_props(self, props: List[Prop], metadata: Dict[str, Any] = None) -> bool:
        """Upload props data to Supabase"""
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
            
            payload = {
                'job_type': 'prizepicks_scrape',
                'props': props_data,
                'metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'total_props': len(props_data),
                    'script_version': '1.0',
                    **(metadata or {})
                }
            }
            
            print(f"Uploading {len(props_data)} props to Supabase...")
            
            response = requests.post(
                self.ingestion_endpoint,
                json=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRscHp6bmVld2lrcnBxZnF5Z3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMjY4MTQsImV4cCI6MjA2MzkwMjgxNH0.hcW3ra_vsrA2eMPCe3LWFrGbuuhC_oadxXsS0bFDAg0'
                },
                timeout=300  # 5 minute timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"Successfully uploaded props. Job ID: {result.get('job_id')}")
                    print(f"Processing result: {result.get('result')}")
                    return True
                else:
                    print(f"Upload failed: {result.get('error')}")
                    return False
            else:
                print(f"HTTP Error {response.status_code}: {response.text}")
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
    
    def upload_with_retry(self, props: List[Prop], max_retries: int = 3, metadata: Dict[str, Any] = None) -> bool:
        """Upload props with retry logic"""
        for attempt in range(max_retries):
            print(f"Upload attempt {attempt + 1}/{max_retries}")
            
            if self.upload_props(props, metadata):
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
    from Main import load_props_from_file
    
    # Load props from your existing pickle file
    props = load_props_from_file('nba_props.pkl')
    
    if props:
        uploader = SupabaseUploader()
        success = uploader.upload_with_retry(props, metadata={
            'source': 'main_script',
            'nba_props_count': len(props)
        })
        
        if success:
            print("Props successfully uploaded to Supabase!")
        else:
            print("Failed to upload props to Supabase")
    else:
        print("No props found to upload")

if __name__ == "__main__":
    integrate_with_main()
