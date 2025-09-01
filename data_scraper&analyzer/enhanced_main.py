
# Enhanced version of your main script with Supabase integration
import traceback
import pickle
import PPnbapicks
import time
import dataFinder
import csv
from fanduel import filtered_data
import requests
from bs4 import BeautifulSoup
import pandas as pd
from unidecode import unidecode
from supabase_uploader import SupabaseUploader
import schedule
import threading
from datetime import datetime
import os

class EnhancedPropsProcessor:
    def __init__(self):
        self.uploader = SupabaseUploader()
        self.is_running = False
        self.existing_props_cache = set()
        self.last_cache_update = None
        
        # Check if we need to set credentials manually
        self.check_and_setup_credentials()
    
    def check_and_setup_credentials(self):
        """Check and setup Supabase credentials if needed"""
        if not self.uploader.enabled:
            print("Supabase uploader is disabled. Checking for manual credential setup...")
            
            # Try to load from .env file first
            self.load_env_file()
            
            # Try to get from environment variables
            env_url = os.environ.get('SUPABASE_URL')
            env_key = os.environ.get('SUPABASE_KEY')
            
            if env_url and env_key:
                print("Found credentials in environment variables")
                # Update the uploader with these credentials
                self.uploader.update_credentials(env_url, env_key)
                print("Uploader enabled with environment credentials")
            else:
                # Try to reload from environment
                if self.uploader.reload_from_environment():
                    print("Uploader enabled by reloading from environment")
                else:
                    print("Uploader remains disabled - no valid credentials found")
                    print("No credentials found. You may need to:")
                    print("1. Set SUPABASE_URL and SUPABASE_KEY environment variables")
                    print("2. Or create a .env file with these variables")
                    print("3. Or manually set credentials using set_credentials() method")
        else:
            print("Supabase uploader is enabled and ready")
    
    def load_env_file(self):
        """Load environment variables from .env file if it exists"""
        try:
            env_file = '.env'
            if os.path.exists(env_file):
                print(f"Loading credentials from {env_file} file...")
                with open(env_file, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, value = line.split('=', 1)
                            os.environ[key.strip()] = value.strip()
                print("Environment variables loaded from .env file")
                
                # After loading .env, try to reload uploader credentials
                if self.uploader.reload_from_environment():
                    print("✅ Uploader credentials updated from .env file")
                else:
                    print("⚠️ Could not update uploader credentials from .env file")
        except Exception as e:
            print(f"Error loading .env file: {e}")
    
    def set_credentials(self, url, key):
        """Manually set Supabase credentials"""
        self.uploader.update_credentials(url, key)
        print(f"Credentials set manually. URL: {url}")
        print("Uploader enabled")
    
    def reload_uploader_credentials(self):
        """Force reload uploader credentials from environment"""
        print("🔄 Reloading uploader credentials from environment...")
        if self.uploader.reload_from_environment():
            print("✅ Uploader credentials reloaded successfully")
        else:
            print("❌ Failed to reload uploader credentials")
    
    def clear_cache(self):
        """Clear the existing props cache to force a fresh database query"""
        self.existing_props_cache.clear()
        self.last_cache_update = None
        print("🗑️ Cache cleared - next filtering will query database fresh")
    
    def force_cache_refresh(self, league_id):
        """Force a cache refresh for a specific league"""
        print(f"🔄 Forcing cache refresh for league {league_id}...")
        self.clear_cache()
        self.update_existing_props_cache(league_id)
    
    def show_cache_status(self):
        """Show the current status of the props cache"""
        print("\n📊 Props Cache Status")
        print("=" * 30)
        print(f"Cache size: {len(self.existing_props_cache)} props")
        if self.last_cache_update:
            print(f"Last updated: {self.last_cache_update.strftime('%Y-%m-%d %H:%M:%S')}")
            time_since_update = (datetime.now() - self.last_cache_update).seconds
            print(f"Age: {time_since_update} seconds ({time_since_update/60:.1f} minutes)")
        else:
            print("Last updated: Never")
        
        if self.existing_props_cache:
            print(f"Sample keys: {list(self.existing_props_cache)[:3]}")
        
        # Estimate total props in database
        if self.uploader.enabled:
            try:
                headers = {
                    'Content-Type': 'application/json',
                    'apikey': self.uploader.supabase_key,
                    'Authorization': f'Bearer {self.uploader.supabase_key}'
                }
                
                # Get total count for NBA and NFL
                for league_id, league_name in [(7, 'NBA'), (9, 'NFL')]:
                    count_url = f"{self.uploader.supabase_url}/rest/v1/props?select=id&league_id=eq.{league_id}"
                    response = requests.get(count_url, headers=headers, timeout=10)
                    if response.status_code == 200:
                        # Count total results by checking Content-Range header or response length
                        total_count = len(response.json())
                        print(f"Database {league_name} props: ~{total_count}+ (may be limited by 1000)")
            except Exception as e:
                print(f"Could not estimate database size: {e}")
        
        print("=" * 30)
        
    def load_props_from_file(self, filename='nba_props.pkl'):
        """Load props from pickle file"""
        try:
            with open(filename, 'rb') as f:
                props = pickle.load(f)
                return props
        except FileNotFoundError:
            return []
    
    def get_existing_props_from_database(self, league_id):
        """Fetch existing props from database to avoid redundant processing"""
        try:
            # Check if uploader has credentials
            if not self.uploader.enabled:
                print("Warning: Supabase uploader is disabled - cannot check database")
                return set()
            
            # Use the credentials from the uploader
            supabase_url = self.uploader.supabase_url
            supabase_key = self.uploader.supabase_key
            
            if not supabase_url or not supabase_key:
                print("Warning: Cannot check database - missing credentials in uploader")
                # Try to get from environment variables as fallback
                supabase_url = os.environ.get('SUPABASE_URL')
                supabase_key = os.environ.get('SUPABASE_KEY')
                
                if not supabase_url or not supabase_key:
                    print("Warning: No Supabase credentials found in environment variables either")
                    return set()
                else:
                    print("Using credentials from environment variables")
            
            # Query existing props for the specific league using REST API with pagination
            headers = {
                'Content-Type': 'application/json',
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}'
            }
            
            # Use pagination to get ALL props (Supabase has 1000 limit per query)
            all_props = []
            offset = 0
            limit = 1000  # Supabase max per request
            
            while True:
                query_url = f"{supabase_url}/rest/v1/props"
                params = {
                    'select': 'player_name,stat_type,line_score,odds_type,team_name,league_id',
                    'league_id': f'eq.{league_id}',
                    'limit': str(limit),
                    'offset': str(offset)
                }
                
                print(f"Querying database for existing props (league {league_id}) - offset {offset}...")
                
                response = requests.get(query_url, headers=headers, params=params)
                
                if response.status_code == 200:
                    batch_props = response.json()
                    if not batch_props:  # No more results
                        break
                    
                    all_props.extend(batch_props)
                    print(f"  Retrieved {len(batch_props)} props (total so far: {len(all_props)})")
                    
                    if len(batch_props) < limit:  # Last batch
                        break
                    
                    offset += limit
                else:
                    print(f"Error querying database: {response.status_code} - {response.text}")
                    break
            
            # Create a set of unique prop identifiers
            prop_set = set()
            for prop in all_props:
                prop_key = f"{prop['player_name']}|{prop['stat_type']}|{prop['line_score']}|{prop['odds_type']}|{prop['team_name']}|{prop['league_id']}"
                prop_set.add(prop_key)
            
            print(f"✅ Total: Found {len(all_props)} existing props in database for league {league_id}")
            return prop_set
                
        except Exception as e:
            print(f"Error checking existing props: {e}")
            import traceback
            traceback.print_exc()
            return set()
    
    def is_prop_already_processed(self, prop, league_id):
        """Check if a prop already exists in the database"""
        prop_key = f"{prop.player_name}|{prop.stat_type}|{prop.line_score}|{prop.odds_type}|{prop.team_name}|{prop.league_id}"
        return prop_key in self.existing_props_cache
    
    def update_existing_props_cache(self, league_id):
        """Update the cache of existing props from the database"""
        print(f"🔄 Updating existing props cache for league {league_id}...")
        
        # Test database connection first
        if not self.test_database_connection():
            print("❌ Database connection test failed - skipping cache update")
            return
        
        print("📡 Fetching existing props from database...")
        self.existing_props_cache = self.get_existing_props_from_database(league_id)
        self.last_cache_update = datetime.now()
        
        if self.existing_props_cache:
            print(f"✅ Cache updated successfully with {len(self.existing_props_cache)} existing props")
            # Show a few sample keys for debugging
            sample_keys = list(self.existing_props_cache)[:3]
            print(f"📝 Sample cache keys: {sample_keys}")
        else:
            print("⚠️ Cache update returned empty set - this may indicate an issue")
    
    def test_database_connection(self):
        """Test if we can connect to the Supabase database"""
        try:
            # Get credentials
            supabase_url = self.uploader.supabase_url or os.environ.get('SUPABASE_URL')
            supabase_key = self.uploader.supabase_key or os.environ.get('SUPABASE_KEY')
            
            if not supabase_url or not supabase_key:
                print("No Supabase credentials available for connection test")
                return False
            
            # Test with a simple query
            headers = {
                'Content-Type': 'application/json',
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}'
            }
            
            test_url = f"{supabase_url}/rest/v1/props?select=id&limit=1"
            response = requests.get(test_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                print("Database connection test successful")
                return True
            else:
                print(f"Database connection test failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Database connection test error: {e}")
            return False
    
    def check_credentials_status(self):
        """Check and display the status of Supabase credentials"""
        print("\n=== Supabase Credentials Status ===")
        print(f"Uploader enabled: {self.uploader.enabled}")
        print(f"Uploader URL: {self.uploader.supabase_url}")
        print(f"Uploader key: {'***' + self.uploader.supabase_key[-4:] if self.uploader.supabase_key else 'None'}")
        
        env_url = os.environ.get('SUPABASE_URL')
        env_key = os.environ.get('SUPABASE_KEY')
        print(f"Environment URL: {env_url}")
        print(f"Environment key: {'***' + env_key[-4:] if env_key else 'None'}")
        print("=====================================\n")
    
    def filter_new_props(self, props, league_id):
        """Filter out props that already exist in the database"""
        print(f"\n🔍 Filtering {len(props)} props for league {league_id}...")
        
        # First check credentials status for debugging
        self.check_credentials_status()
        
        # Always update cache if it's empty or older than 5 minutes
        if not self.existing_props_cache or (self.last_cache_update and (datetime.now() - self.last_cache_update).seconds > 300):
            print("Cache is empty or stale - updating from database...")
            self.update_existing_props_cache(league_id)
        else:
            print(f"Using cached data from {self.last_cache_update.strftime('%H:%M:%S')}")
        
        # If we still don't have a cache (database connection failed), treat all props as new
        if not self.existing_props_cache:
            print("⚠️ Warning: No existing props cache available - treating all props as new")
            print("This may result in redundant processing if props already exist in database")
            return props
        
        print(f"📊 Database cache contains {len(self.existing_props_cache)} existing props")
        
        # Show some sample cache keys for debugging
        if self.existing_props_cache:
            sample_keys = list(self.existing_props_cache)[:3]
            print(f"📝 Sample cache keys: {sample_keys}")
        
        new_props = []
        skipped_count = 0
        
        for i, prop in enumerate(props):
            prop_key = f"{prop.player_name}|{prop.stat_type}|{prop.line_score}|{prop.odds_type}|{prop.team_name}|{prop.league_id}"
            if prop_key in self.existing_props_cache:
                skipped_count += 1
                if i < 5:  # Show first few skipped props for debugging
                    print(f"  ✅ Skipping: {prop.player_name} - {prop.stat_type} {prop.line_score} ({prop.odds_type})")
            else:
                new_props.append(prop)
                if i < 5:  # Show first few new props for debugging
                    print(f"  🔄 New: {prop.player_name} - {prop.stat_type} {prop.line_score} ({prop.odds_type})")
        
        print(f"✅ Filtering complete: {len(new_props)} new, {skipped_count} already exist in database")
        
        # Additional debugging info
        if skipped_count > 0:
            print(f"📈 Efficiency: {skipped_count/(skipped_count + len(new_props))*100:.1f}% of props were already processed")
        
        return new_props
    
    def pre_filter_props_for_processing(self, props, league_id, norm_data):
        """
        🚀 OPTIMIZED: Pre-filter props BEFORE processing to remove existing ones from database.
        
        KEY IMPROVEMENTS:
        - Database query happens ONCE per league (not during processing)
        - Props are filtered BEFORE entering analysis methods
        - Massive time savings by avoiding processing of existing props
        - Uses efficient set lookup instead of repeated database calls
        
        This method creates a lookup of existing props and filters the input list efficiently.
        """
        print(f"🚀 Pre-filtering {len(props)} props for league {league_id}...")
        
        # First, get all existing props from database (this happens once per league)
        if not self.existing_props_cache or (self.last_cache_update and (datetime.now() - self.last_cache_update).seconds > 300):
            print("📡 Updating database cache for pre-filtering...")
            self.update_existing_props_cache(league_id)
        
        if not self.existing_props_cache:
            print("⚠️ Warning: No database cache available - treating all props as new")
            return props
        
        print(f"📊 Database cache contains {len(self.existing_props_cache)} existing props")
        
        # Create a fast lookup set for existing props
        existing_props_set = self.existing_props_cache
        
        # Filter props efficiently
        new_props = []
        skipped_count = 0
        
        for prop in props:
            # Create the unique prop identifier
            prop_key = f"{prop.player_name}|{prop.stat_type}|{prop.line_score}|{prop.odds_type}|{prop.team_name}|{prop.league_id}"
            
            if prop_key in existing_props_set:
                skipped_count += 1
            else:
                new_props.append(prop)
        
        print(f"✅ Pre-filtering complete: {len(new_props)} new, {skipped_count} already exist in database")
        
        if skipped_count > 0:
            efficiency = (skipped_count / (skipped_count + len(new_props))) * 100
            print(f"📈 Efficiency: {efficiency:.1f}% of props were already processed")
            print(f"⏱️ Time saved: Skipped processing {skipped_count} existing props")
        
        return new_props
    
    def show_processing_efficiency(self, total_props, new_props, league_name):
        """Show processing efficiency statistics"""
        skipped = total_props - new_props
        if total_props > 0:
            efficiency = (skipped / total_props) * 100
            print(f"\n📊 {league_name} Processing Efficiency:")
            print(f"   Total props: {total_props}")
            print(f"   New props: {new_props}")
            print(f"   Skipped (existing): {skipped}")
            print(f"   Efficiency: {efficiency:.1f}% props already processed")
            print(f"   Time saved: Skipped {skipped} props that were already analyzed")
    
    def store_and_print_tables(self,team):
        if team == "NOP":
            team = "NO"
        if team == "UTA":
            team = "UTAH"
        team_url = f'https://www.espn.com/nba/team/depth/_/name/{team}'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(team_url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        tables = soup.find_all('table')

        table_2 = tables[1]

        table_2_data = []
        rows_2 = table_2.find_all('tr')
        for row in rows_2:
            columns = row.find_all('td')
            row_data = [col.text.strip().removesuffix(" DD").removesuffix(" O") for col in columns]
            if row_data:
                table_2_data.append(row_data)
        return table_2_data


    def fetch_all_team_positions(self, teams):
        position_arr = ['PG',
                            'SG',
                            'SF',
                            'PF',
                            'C']
        team_depth_charts = {}
        position_cache = {}

        for team in teams:
            try:
                depth_chart = self.store_and_print_tables(team)
                team_depth_charts[team] = depth_chart



                for col in range(len(depth_chart[0])):
                    for row in range(len(depth_chart)):
                        player_name = depth_chart[row][col]

                        if player_name not in position_cache:
                            position_cache[player_name] = position_arr[row]

            except Exception as e:
                team_depth_charts[team] = {}

        return position_cache

    def run_processing_cycle(self):
        """Run a complete processing cycle"""
        if self.is_running:
            return
            
        self.is_running = True
        start_time = time.time()
        
        try:
            # Load your existing data
            df = pd.read_csv('Testing.csv')
            output_file = "output_data.csv"
            
            # Process NBA props
            nba_props = self.load_props_from_file('nba_props.pkl')
            nfl_props = self.load_props_from_file('nfl_props.pkl')
            
            # Process NBA data
            nba_norm1 = PPnbapicks.RemoveSearch(PPnbapicks.filter_rows_by_league_id(df, 7), "Combo")
            
            if not nba_norm1.empty:
                nba_norm2 = PPnbapicks.RemoveSearch(nba_norm1, "Dunks")
                nba_norm = PPnbapicks.RemoveSearch(nba_norm2, "Fantasy Score")
                
                if not nba_norm.empty:
                    nba_norm['Display Name'] = nba_norm['Display Name'].apply(unidecode)
                    
                    pd.set_option('display.max_rows', None)
                    pd.set_option('display.max_columns', None)
                    pd.set_option('display.width', None)
                    pd.set_option('display.max_colwidth', None)
                    
                    # OPTIMIZED: Pre-filter NBA props BEFORE processing to save time
                    print("🚀 Pre-filtering NBA props to remove existing ones from database...")
                    new_nba_props = self.pre_filter_props_for_processing(nba_props, 7, nba_norm)
                    
                    if new_nba_props:
                        # Show efficiency statistics
                        self.show_processing_efficiency(len(nba_props), len(new_nba_props), "NBA")
                        
                        print(f"✅ Processing {len(new_nba_props)} new NBA props...")
                        # Process NBA data with your existing algorithms
                        self.nba_processing(0, "since-2023-2024-season", new_nba_props, nba_norm)
                        self.nba_processing(0, "since-2024-2025-season", new_nba_props, nba_norm)
                        
                        # Save updated NBA props
                        with open('nba_props.pkl', 'wb') as f:
                            pickle.dump(nba_props, f)
                        
                        # Upload only new NBA props to Supabase
                        success = self.uploader.upload_with_retry(new_nba_props, metadata={
                            'processing_time_seconds': time.time() - start_time,
                            'total_props': len(new_nba_props),
                            'existing_props_skipped': len(nba_props) - len(new_nba_props),
                            'league': 'NBA',
                            'timestamp': datetime.now().isoformat()
                        })
                    else:
                        print("✅ No new NBA props to process - all already exist in database")
                        self.show_processing_efficiency(len(nba_props), 0, "NBA")
            
            # Process NFL data
            nfl_norm = PPnbapicks.filter_rows_by_league_id(df, 9)  # League ID 9 for NFL
            
            if not nfl_norm.empty:
                nfl_norm['Display Name'] = nfl_norm['Display Name'].apply(unidecode)
                
                # OPTIMIZED: Pre-filter NFL props BEFORE processing to save time
                print("🚀 Pre-filtering NFL props to remove existing ones from database...")
                new_nfl_props = self.pre_filter_props_for_processing(nfl_props, 9, nfl_norm)
                
                if new_nfl_props:
                    # Show efficiency statistics
                    self.show_processing_efficiency(len(nfl_props), len(new_nfl_props), "NFL")
                    
                    print(f"✅ Processing {len(new_nfl_props)} new NFL props...")
                    # Process NFL data
                    self.nfl_processing(0, nfl_norm, new_nfl_props)
                    
                    # Save updated NFL props
                    with open('nfl_props.pkl', 'wb') as f:
                        pickle.dump(nfl_props, f)
                    
                    # Upload only new NFL props to Supabase
                    success = self.uploader.upload_with_retry(new_nfl_props, metadata={
                        'processing_time_seconds': time.time() - start_time,
                        'total_props': len(new_nfl_props),
                        'existing_props_skipped': len(nfl_props) - len(new_nfl_props),
                        'league': 'NFL',
                        'timestamp': datetime.now().isoformat()
                    })
                else:
                    print("✅ No new NFL props to process - all already exist in database")
                    self.show_processing_efficiency(len(nfl_props), 0, "NFL")
                
            end_time = time.time()
            elapsed_time = end_time - start_time
            print(f"⏱️ Total processing time: {elapsed_time:.2f} seconds")
            
        except Exception as e:
            print(f"❌ Error in processing cycle: {e}")
            import traceback
            traceback.print_exc()
        finally:
            self.is_running = False
    
    
    def nba_processing(self, num, timeframe, props, norm):
        output_file = "output_data.csv"
        name = PPnbapicks.Lists(norm, "Name")
        line = PPnbapicks.Lists(norm, "lineScore")
        stat = PPnbapicks.Lists(norm, "StatType")
        odds = PPnbapicks.Lists(norm, "OddType")
        team = PPnbapicks.Lists(norm, "TeamName")
        gameid = PPnbapicks.Lists(norm, "GameID")

        global h2harr, current_player, current_prop, L5arr, h2hstatarr
        unique_teams = norm["Team Name"].nunique()
        prop_counts = norm["Odds Type"].value_counts().to_dict()
        num_goblin = prop_counts.get("goblin", 0)
        num_demon = prop_counts.get("demon", 0)
        num_standard = prop_counts.get("standard", 0)

        game_team_map = norm.groupby("Game ID")["Team Name"].unique().to_dict()
        against_team_map = {}

        for game_id, teams in game_team_map.items():
            if len(teams) == 2:
                team1, team2 = teams
                against_team_map[game_id] = {team1: team2, team2: team1}
            else:
                team_name = teams[0]
                against_team_map[game_id] = {team_name: dataFinder.against_team(team_name)}

        unique_teams = norm["Team Name"].unique()
        print(f"Fetching depth charts for {len(unique_teams)} teams...")

        position_cache = self.fetch_all_team_positions(unique_teams)
        print(position_cache)
        L5score = []
        h2hscore = []
        data_rows = []
        data_rows_demon = []
        data_rows_goblin = []
        headers = ['Name', 'Position', 'Team','AgainstTeam', 'Stat', 'Line', 'Odds', 'H2HArray', 'L5Array', 'Temp', 'Size', 'H2HAvg','L5Avg', 'Diff',
                "Rel Diff",
                'Percent',
                'Sample Size',
                'Score', 'GameId']
        col_widths = [len(header) + 2 for header in headers]  # Initial column widths based on header size

        header_row = "".join(f"{header:<{col_widths[i]}}" for i, header in enumerate(headers))
        print(header_row)
        
        # OPTIMIZED: Only process rows that have corresponding props in our filtered list
        # Create a mapping from norm data to props for efficient lookup
        norm_to_prop_map = {}
        for prop in props:
            # Create a key that matches the norm data structure
            prop_key = (prop.player_name, prop.stat_type, prop.line_score, prop.odds_type)
            norm_to_prop_map[prop_key] = prop
        
        print(f"📊 Created norm-to-prop mapping with {len(norm_to_prop_map)} entries")
        print(f"📝 Sample mapping keys: {list(norm_to_prop_map.keys())[:3] if norm_to_prop_map else 'None'}")

        # Track which rows we actually process
        processed_rows = 0
        skipped_rows = 0
        
        # Track stats fetching for debugging
        request_count = 0
        failed_requests = 0
        stats_fetch_success = 0
        stats_fetch_failed = 0
        
        for i in range(num, len(norm)):
            try:
                current_player = name[i]
                current_prop = f"{stat[i]} over {line[i]}"

                # Check if this row corresponds to a prop we should process
                row_key = (current_player, stat[i], line[i], odds[i])
                if row_key not in norm_to_prop_map:
                    print(f"⏭️ Skipping row {i}: {current_player} - {stat[i]} {line[i]} ({odds[i]}) - not in filtered props list")
                    skipped_rows += 1
                    continue

                # Get the corresponding prop from our filtered list
                prop = norm_to_prop_map[row_key]
                print(f"✅ Processing row {i}: {current_player} - {stat[i]} {line[i]} ({odds[i]})")

                team_name = norm.iloc[i]["Team Name"]
                against_team = against_team_map.get(gameid[i], {}).get(team_name, "Unknown")
                prop.against_team = against_team
                if 'StartTime' in norm.columns:
                    raw_time = norm.iloc[i]['StartTime']
                    if pd.isna(raw_time) or raw_time in ['', 'NaT', None]:
                        prop.start_time = None
                    else:
                        try:
                            # Convert to ISO 8601
                            parsed_time = pd.to_datetime(raw_time)
                            prop.start_time = parsed_time.isoformat()
                        except:
                            print(f"⚠️ Invalid start_time for row {i}: {raw_time}")
                            prop.start_time = None
                else:
                    prop.start_time = "2025-06-18T22:00:00Z"

                position = position_cache.get(current_player, "Unknown")
                # Don't append to player_positions here - it causes misalignment
                # Instead, we'll use the position directly when needed

                # Track request timing
                request_start_time = time.time()
                request_count += 1
                
                print(f"📡 Request #{request_count}: Fetching stats for {current_player} vs {against_team} ({stat[i]})")
                
                # Instant stats fetching
                try:
                    if i == 0 or name[i] != name[i - 1]:
                        print(f"  🔄 Fetching H2H stats for {current_player} vs {against_team}...")
                        h2harr = self.fetch_stats_instant(
                            lambda: dataFinder.stats_against_team_t_season(name[i], against_team, timeframe),
                            f"H2H stats for {current_player} vs {against_team}"
                        )
                        if h2harr:
                            stats_fetch_success += 1
                            print(f"  ✅ H2H stats fetched successfully: {len(h2harr)} games")
                        else:
                            stats_fetch_failed += 1
                            print(f"  ❌ Failed to fetch H2H stats for {current_player}")
                            continue
                    
                    if i == 0 or stat[i] != stat[i - 1]:
                        print(f"  🔄 Fetching specific stat data for {stat[i]}...")
                        h2hstatarr = self.fetch_stats_instant(
                            lambda: dataFinder.specific_stat_vs_opp_games_arr(h2harr, stat[i]),
                            f"Specific stat {stat[i]} for {current_player}"
                        )
                        if not h2hstatarr:
                            print(f"  ❌ Failed to fetch specific stat data for {stat[i]}")
                            continue
                    
                    request_time = time.time() - request_start_time
                    print(f"  ⏱️ Stats fetch completed in {request_time:.2f}s")
                    
                except Exception as e:
                    failed_requests += 1
                    print(f"  ❌ Error fetching stats for {current_player}: {e}")
                    continue

                h2hsize = len(h2hstatarr)
                if timeframe == "since-2024-2025-season":
                    prop.add_performance_data(h2hstatarr, "H2H1Y")
                elif timeframe == "since-2023-2024-season":
                    prop.add_performance_data(h2hstatarr, "H2H2Y")

                L5temp = 0
                h2htemp = 0
                h2hinjury = 0
                for j in range(num, h2hsize):
                    if h2hstatarr[j] >= line[i]:
                        h2htemp += 1
                    elif h2hinjury < 1 and dataFinder.specific_stat_vs_opp_games_arr(h2harr, "Min")[j] < 20:
                        h2hinjury += 1
                    elif stat[i] not in ["Blks+Stls", "Steals", "Blocked Shots", "Turnovers"]:
                        if h2hstatarr[j] + 1 >= line[i]:
                            h2htemp += 0.5
                if h2hsize == 0:
                    h2hsize = 1
                h2htemp = h2htemp + h2hinjury
                h2hscore.append(h2htemp / h2hsize)

                if odds[i] == "goblin":
                    threshold = 0.875
                else:
                    threshold = 0.75

                if h2htemp / h2hsize >= threshold and sum(h2hstatarr) / len(h2hstatarr) - line[i] >= 0:
                    L5arr = dataFinder.stats_ten_games(name[i])
                    L5statarr = dataFinder.specific_stat_l10_games(L5arr, stat[i])
                    L5statarr = L5statarr[-5:]
                    L5size = len(L5statarr)
                    prop.add_performance_data(L5statarr, "L5")
                    for j in range(num, L5size):
                        if L5statarr[j] >= line[i]:
                            L5temp += 1
                        elif stat[i] not in ["Blks+Stls", "Steals", "Blocked Shots", "Turnovers"]:
                            if L5statarr[j] + 1 >= line[i]:
                                L5temp += 0.5
                    if L5size == 0:
                        L5size = 1
                    L5score.append(L5temp / L5size)
                    L5avg = round(sum(L5statarr) / 5, 3)
                    L5diff = round(L5avg - line[i], 3)
                    L5relative_diff = round((L5avg - line[i]) / (line[i] + 5), 3)
                    L5percent = round(100 * (sum(L5statarr) / 5 - line[i]) / line[i], 3)

                    h2havg = round(sum(h2hstatarr) / len(h2hstatarr), 3)
                    h2hdiff = round(h2havg - line[i], 3)
                    h2hrelative_diff = round((h2havg - line[i]) / (line[i] + 5), 3)
                    h2hpercent = round(100 * (sum(h2hstatarr) / len(h2hstatarr) - line[i]) / line[i], 3)
                    sample_size = h2hsize
                    sorting_score = (
                            (h2htemp / h2hsize) * 0.45 +
                            (h2hrelative_diff * 0.20) +
                            (sample_size * 0.20) +
                            (L5temp / 5) * 0.1 +
                            (L5relative_diff * 0.05)
                    )
                    sorting_score = round(sorting_score, 3)
                    row = [
                        name[i],
                        position,  # Use current position instead of player_positions[i]
                        team[i],
                        against_team,
                        stat[i],
                        line[i],
                        odds[i],
                        str(h2hstatarr),
                        str(L5statarr),
                        h2htemp,
                        h2hsize,
                        h2havg,
                        L5avg,
                        h2hdiff,
                        h2hrelative_diff,
                        h2hpercent,
                        sample_size,
                        sorting_score,
                        gameid[i]
                    ]
                    if odds[i] == "standard":
                        data_rows.append(row)
                    elif odds[i] == "demon":
                        data_rows_demon.append(row)
                    elif odds[i] == "goblin":
                        data_rows_goblin.append(row)
                    col_widths = [max(col_widths[i], len(str(row[i])) + 2) for i in range(len(headers))]

                    if len(row) != len(col_widths):
                        pass  # Row length mismatch
                    else:
                        formatted_row = "".join(f"{str(item):<{col_widths[i]}}" for i, item in enumerate(row))


                    # Increment processed count
                    processed_rows += 1

            except Exception as e:
                print(f"❌ Error processing NBA prop row {i}: {e}")
                pass  # Error processing NBA prop
        with open(output_file, mode="w", newline="", encoding="utf-8-sig") as file:
            writer = csv.writer(file)

            writer.writerow(['Name', 'Stat', 'Line', 'Odds', 'Array', 'Temp', 'Size', 'Avg', 'Diff',
                            "Rel Diff", 'Percent', 'Sample Size', 'Score', 'GameId'])

            for row in data_rows:
                writer.writerow(row)

            for row in data_rows_demon:
                writer.writerow(row)

            for row in data_rows_goblin:
                writer.writerow(row)

        print(f"Data saved to {output_file}")

        ssrownum = 17
        gamerownum = ssrownum + 1
        data_rows.sort(key=lambda row: (row[ssrownum]), reverse=True)
        data_rows_demon.sort(key=lambda row: (row[ssrownum]), reverse=True)
        data_rows_goblin.sort(key=lambda row: (row[ssrownum]), reverse=True)
        # Print the final well-aligned table at the end
        print("\nFinal Standard Data Table (Sorted by Sorting Score):\n")
        # Reprint the header
        header_row = "".join(f"{header:<{col_widths[i]}}" for i, header in enumerate(headers))
        print(header_row)

        # Reprint all the rows
        for row in data_rows:
            formatted_row = "".join(f"{str(item):<{col_widths[i]}}" for i, item in enumerate(row))
            print(formatted_row)
        print("\nFinal Demon Data Table (Sorted by Sorting Score):\n")
        print(header_row)
        for row in data_rows_demon:
            formatted_row = "".join(f"{str(item):<{col_widths[i]}}" for i, item in enumerate(row))
            print(formatted_row)
        print("\nFinal Goblin Data Table (Sorted by Sorting Score):\n")
        print(header_row)
        for row in data_rows_goblin:
            formatted_row = "".join(f"{str(item):<{col_widths[i]}}" for i, item in enumerate(row))
            print(formatted_row)

        data_rows.sort(key=lambda row: row[gamerownum])
        data_rows_demon.sort(key=lambda row: row[gamerownum])
        data_rows_goblin.sort(key=lambda row: row[gamerownum])
        print("\nFinal Standard Data Table (Sorted by Game):\n")
        print(header_row)
        for row in data_rows:
            formatted_row = "".join(f"{str(item):<{col_widths[i]}}" for i, item in enumerate(row))
            print(formatted_row)
        print("\nFinal Demon Data Table (Sorted by Game):\n")
        print(header_row)
        for row in data_rows_demon:
            formatted_row = "".join(f"{str(item):<{col_widths[i]}}" for i, item in enumerate(row))
            print(formatted_row)
        print("\nFinal Goblin Data Table (Sorted by Game):\n")
        print(header_row)
        for row in data_rows_goblin:
            formatted_row = "".join(f"{str(item):<{col_widths[i]}}" for i, item in enumerate(row))
            print(formatted_row)

        print(h2hscore)
        
        # Show processing summary
        print(f"\n📊 NBA Processing Summary:")
        print(f"   Total rows in norm data: {len(norm)}")
        print(f"   Rows processed: {processed_rows}")
        print(f"   Rows skipped (not in filtered props): {skipped_rows}")
        print(f"   Props in filtered list: {len(props)}")
        if len(norm) > 0:
            efficiency = (skipped_rows / len(norm)) * 100
            print(f"   Efficiency: {efficiency:.1f}% of rows were skipped (already processed)")
        
        # 🚀 ENHANCED: Show stats fetching performance
        print(f"\n📡 StatMuse Request Performance:")
        print(f"   Total requests made: {request_count}")
        print(f"   Successful stats fetches: {stats_fetch_success}")
        print(f"   Failed stats fetches: {stats_fetch_failed}")
        print(f"   Failed requests: {failed_requests}")
        if request_count > 0:
            success_rate = (stats_fetch_success / request_count) * 100
            print(f"   Stats fetch success rate: {success_rate:.1f}%")
        
        # Show rate limiting info
        total_time = time.time() - start_time if 'start_time' in locals() else 0
        if total_time > 0:
            avg_request_time = total_time / request_count if request_count > 0 else 0
            print(f"   Average time per request: {avg_request_time:.2f}s")
            print(f"   Total processing time: {total_time:.2f}s")
    def nfl_processing(self, num, norm, props):
        # Store original norm for reference
        original_norm = norm.copy()
        
        # Remove unwanted prop types
        norm = PPnbapicks.RemoveSearch(norm, "Fantasy Score")
        norm = PPnbapicks.RemoveSearch(norm, "Combo")
        norm = PPnbapicks.RemoveSearch(norm, "Longest Rush")
        norm = PPnbapicks.RemoveSearch(norm, "Longest Reception")
        norm = PPnbapicks.RemoveSearch(norm, "Longest Completion")
        norm = PPnbapicks.RemoveSearch(norm, "Sacks")
        norm = PPnbapicks.RemoveSearch(norm, "First")
        norm = PPnbapicks.RemoveSearch(norm, "Tackles+Ast")
        
        print(f"Original norm length: {len(original_norm)}")
        print(f"Filtered norm length: {len(norm)}")
        print(f"Removed {len(original_norm) - len(norm)} rows")
        print(norm.columns)
        print(norm)
        
        import traceback
        
        # Get lists from the FILTERED norm (this ensures proper alignment)
        name = PPnbapicks.Lists(norm, "Name")
        line = PPnbapicks.Lists(norm, "lineScore")
        stat = PPnbapicks.Lists(norm, "StatType")
        odds = PPnbapicks.Lists(norm, "OddType")
        team = PPnbapicks.Lists(norm, "TeamName")
        gameid = PPnbapicks.Lists(norm, "GameID")
        position = PPnbapicks.Lists(norm, "Position")

        print("Analyzing NFL props...\n")
        print(f"📊 NFL Processing Debug Info:")
        print(f"   Total rows in filtered norm: {len(norm)}")
        print(f"   Props to process: {len(props)}")
        print(f"   Sample norm data structure:")
        if len(norm) > 0:
            print(f"     Columns: {list(norm.columns)}")
            print(f"     First row: {norm.iloc[0].to_dict() if len(norm) > 0 else 'No data'}")

        prop_counts = norm["Odds Type"].value_counts().to_dict()
        num_goblin = prop_counts.get("goblin", 0)
        num_demon = prop_counts.get("demon", 0)
        num_standard = prop_counts.get("standard", 0)
        print(f"Goblin props: {num_goblin}, Demon props: {num_demon}, Standard props: {num_standard}")

        game_team_map = norm.groupby("Game ID")["Team Name"].unique().to_dict()
        against_team_map = {
            game_id: (
                {teams[0]: dataFinder.against_team_nfl(teams[0])} if len(teams) != 2
                else {teams[0]: teams[1], teams[1]: teams[0]}
            )
            for game_id, teams in game_team_map.items()
        }

        headers = ['Name', 'Team', 'AgainstTeam', 'Stat', 'Line', 'Odds', 'Array', 'Temp', 'Size',
                'Avg', 'Diff', 'Rel Diff', 'Percent', 'Score', 'GameId']
        col_widths = [len(h) + 2 for h in headers]
        header_row = "".join(f"{h:<{col_widths[i]}}" for i, h in enumerate(headers))
        print(header_row)

        data_rows, data_rows_demon, data_rows_goblin = [], [], []
        prop_lookup = {
            (p.player_name, p.stat_type, p.line_score, p.odds_type): p
            for p in props
        }
        
        print(f"📊 Created prop lookup with {len(prop_lookup)} keys")
        print(f"📝 Sample lookup keys: {list(prop_lookup.keys())[:3] if prop_lookup else 'None'}")

        # OPTIMIZED: Only process rows that have corresponding props in our filtered list
        # Create a mapping from norm data to props for efficient lookup
        norm_to_prop_map = {}
        for prop in props:
            # Create a key that matches the norm data structure
            prop_key = (prop.player_name, prop.stat_type, prop.line_score, prop.odds_type)
            norm_to_prop_map[prop_key] = prop
        
        print(f"📊 Created norm-to-prop mapping with {len(norm_to_prop_map)} entries")
        print(f"📝 Sample mapping keys: {list(norm_to_prop_map.keys())[:3] if norm_to_prop_map else 'None'}")

        # Track which rows we actually process
        processed_rows = 0
        skipped_rows = 0
        
        # Track stats fetching for debugging
        request_count = 0
        failed_requests = 0
        stats_fetch_success = 0
        stats_fetch_failed = 0
        
        # Cache for player stats to avoid refetching for same player
        player_stats_cache = {}
        
        # Debug: Show what we're about to process
        print(f"\n🔍 DEBUG: Processing {len(norm)} rows with {len(props)} props")
        print(f"   Sample players to process:")
        for i in range(min(5, len(norm))):
            print(f"     Row {i}: {name[i]} - {stat[i]} {line[i]} ({odds[i]})")
        print()

        for i in range(num, len(norm)):
            try:
                current_player = name[i]
                current_prop = f"{stat[i]} over {line[i]}"
                team_name = norm.iloc[i]["Team Name"]
                game_id = gameid[i]
                against_team = against_team_map.get(game_id, {}).get(team_name, "Unknown")
                current_odds = odds[i]

                # Check if this row corresponds to a prop we should process
                row_key = (current_player, stat[i], line[i], current_odds)
                if row_key not in norm_to_prop_map:
                    print(f"⏭️ Skipping row {i}: {current_player} - {stat[i]} {line[i]} ({current_odds}) - not in filtered props list")
                    skipped_rows += 1
                    continue

                # Get the corresponding prop from our filtered list
                prop = norm_to_prop_map[row_key]
                print(f"✅ Processing row {i}: {current_player} - {stat[i]} {line[i]} ({current_odds})")

                # Set against_team and start_time
                try:
                    prop.against_team = against_team
                    if 'StartTime' in norm.columns:
                        raw_time = norm.iloc[i]['StartTime']
                        if pd.isna(raw_time) or raw_time in ['', 'NaT', None]:
                            prop.start_time = None
                        else:
                            try:
                                parsed_time = pd.to_datetime(raw_time)
                                prop.start_time = parsed_time.isoformat()
                            except:
                                print(f"⚠️ Invalid start_time for row {i}: {raw_time}")
                                prop.start_time = None
                    else:
                        prop.start_time = "2025-06-18T22:00:00Z"
                except Exception as e:
                    print(f"⚠️ Error setting prop attributes for {current_player}: {e}")
                    continue

                # Track request timing
                request_start_time = time.time()
                request_count += 1
                
                print(f"📡 Request #{request_count}: Fetching NFL stats for {current_player} vs {against_team} ({stat[i]})")
                
                # Instant stats fetching
                try:
                    # Check if we already have stats for this player
                    if current_player in player_stats_cache:
                        print(f"  📋 Using cached stats for {current_player}")
                        cached_stats = player_stats_cache[current_player]
                        h2harr = cached_stats.get('h2harr')
                        L5arr = cached_stats.get('L5arr')
                        h2hstatarr = cached_stats.get('h2hstatarr', {}).get(stat[i])
                        L5statarr = cached_stats.get('L5statarr', {}).get(stat[i])
                        
                        # Debug cache contents
                        print(f"    📊 Cache debug for {current_player}:")
                        print(f"      H2H base data: {len(h2harr) if h2harr else 'None'}")
                        print(f"      L5 base data: {len(L5arr) if L5arr else 'None'}")
                        print(f"      H2H stat '{stat[i]}': {len(h2hstatarr) if h2hstatarr else 'None'}")
                        print(f"      L5 stat '{stat[i]}': {len(L5statarr) if L5statarr else 'None'}")
                        
                        # EFFICIENCY FIX: Only fetch missing data, not everything
                        needs_h2h_fetch = h2hstatarr is None and h2harr
                        needs_l5_fetch = L5statarr is None and L5arr
                        
                        if needs_h2h_fetch or needs_l5_fetch:
                            print(f"  🔄 Fetching missing specific stat data for {stat[i]}...")
                            
                            # Fetch H2H if needed and possible
                            if needs_h2h_fetch:
                                h2hstatarr = self.fetch_stats_instant(
                                    lambda: dataFinder.nfl_stat(current_player, stat[i], against_team, position[i], h2harr),
                                    f"NFL specific stat {stat[i]} for {current_player}"
                                )
                                if not h2hstatarr:
                                    h2hstatarr = []
                            
                            # Fetch L5 if needed and possible
                            if needs_l5_fetch:
                                L5statarr = self.fetch_stats_instant(
                                    lambda: dataFinder.nfl_stat_L5(current_player, stat[i], against_team, position[i], L5arr),
                                    f"NFL L5 specific stat {stat[i]} for {current_player}"
                                )
                                if not L5statarr:
                                    print(f"  ❌ Failed to fetch L5 data for {current_player} - {stat[i]}")
                                    continue
                            
                            # Update cache with new stat data
                            if 'h2hstatarr' not in player_stats_cache[current_player]:
                                player_stats_cache[current_player]['h2hstatarr'] = {}
                            if 'L5statarr' not in player_stats_cache[current_player]:
                                player_stats_cache[current_player]['L5statarr'] = {}
                            
                            # CRITICAL: Ensure we never cache None values - convert to empty lists
                            player_stats_cache[current_player]['h2hstatarr'][stat[i]] = h2hstatarr if h2hstatarr is not None else []
                            player_stats_cache[current_player]['L5statarr'][stat[i]] = L5statarr if L5statarr is not None else []
                            
                            print(f"    ✅ Updated cache for {current_player} - {stat[i]}:")
                            print(f"      H2H: {len(h2hstatarr) if h2hstatarr else 'None'}")
                            print(f"      L5: {len(L5statarr) if L5statarr else 'None'}")
                        else:
                            print(f"    ✅ All required data already cached for {current_player} - {stat[i]}")
                        
                        # CRITICAL FIX: Ensure h2hstatarr is never None - convert to empty list if needed
                        if h2hstatarr is None:
                            h2hstatarr = []
                            print(f"  🔧 Fixed: h2hstatarr was None, set to empty list")
                        
                        # CRITICAL FIX: Ensure L5statarr is never None - convert to empty list if needed
                        if L5statarr is None:
                            L5statarr = []
                            print(f"  🔧 Fixed: L5statarr was None, set to empty list")
                        
                        # CRITICAL FIX: Ensure L5 data is always available for scoring
                        if not L5statarr or len(L5statarr) == 0:
                            print(f"  ⚠️ L5 data missing for {current_player} - {stat[i]}, fetching fresh...")
                            if L5arr:
                                L5statarr = self.fetch_stats_instant(
                                    lambda: dataFinder.nfl_stat_L5(current_player, stat[i], against_team, position[i], L5arr),
                                    f"NFL L5 specific stat {stat[i]} for {current_player} (refetch)"
                                )
                                # Update cache
                                if 'L5statarr' not in player_stats_cache[current_player]:
                                    player_stats_cache[current_player]['L5statarr'] = {}
                                # CRITICAL: Ensure we never cache None values - convert to empty lists
                                player_stats_cache[current_player]['L5statarr'][stat[i]] = L5statarr if L5statarr is not None else []
                                print(f"    ✅ Refetched L5 data: {len(L5statarr) if L5statarr else 'None'}")
                            else:
                                print(f"  ❌ Cannot fetch L5 data - L5arr is missing")
                                continue
                    else:
                        # First time seeing this player - fetch all data
                        print(f"  🔄 Fetching NFL H2H stats for {current_player} vs {against_team}...")
                        h2harr = self.fetch_stats_instant(
                            lambda: dataFinder.nflprop(current_player, against_team),
                            f"NFL H2H stats for {current_player} vs {against_team}"
                        )
                        if h2harr:
                            stats_fetch_success += 1
                            print(f"  ✅ NFL H2H stats fetched successfully: {len(h2harr)} games")
                        else:
                            stats_fetch_failed += 1
                            print(f"  ⚠️ Failed to fetch NFL H2H stats for {current_player} - will continue with L5 only")
                            h2harr = []  # Set to empty list instead of None
                        
                        print(f"  🔄 Fetching NFL L5 stats for {current_player}...")
                        L5arr = self.fetch_stats_instant(
                            lambda: dataFinder.nflprop_l5(current_player),
                            f"NFL L5 stats for {current_player}"
                        )
                        if not L5arr:
                            print(f"  ❌ Failed to fetch NFL L5 stats for {current_player}")
                            continue
                        print(f"  ✅ NFL L5 stats fetched successfully: {len(L5arr)} games")
                        
                        # Fetch specific stat data
                        print(f"  🔄 Fetching NFL specific stat data for {stat[i]}...")
                        if h2harr:  # Only fetch H2H specific stats if we have H2H data
                            h2hstatarr = self.fetch_stats_instant(
                                lambda: dataFinder.nfl_stat(current_player, stat[i], against_team, position[i], h2harr),
                                f"NFL specific stat {stat[i]} for {current_player}"
                            )
                            if not h2hstatarr:
                                print(f"  ⚠️ Failed to fetch NFL specific stat data for {stat[i]} - will use empty array")
                                h2hstatarr = []
                        else:
                            print(f"  ⚠️ Skipping H2H specific stat fetch for {stat[i]} - no H2H data available")
                            h2hstatarr = []
                        
                        # CRITICAL FIX: Always fetch L5 data regardless of H2H status
                        print(f"  🔄 Fetching NFL L5 specific stat data for {stat[i]}...")
                        L5statarr = self.fetch_stats_instant(
                            lambda: dataFinder.nfl_stat_L5(current_player, stat[i], against_team, position[i], L5arr),
                            f"NFL L5 specific stat {stat[i]} for {current_player}"
                        )
                        if not L5statarr:
                            print(f"  ❌ Failed to fetch NFL L5 specific stat data for {stat[i]}")
                            continue
                        
                        # Cache all the data for this player
                        # CRITICAL: Ensure we never cache None values - convert to empty lists
                        player_stats_cache[current_player] = {
                            'h2harr': h2harr if h2harr is not None else [],
                            'L5arr': L5arr if L5arr is not None else [],
                            'h2hstatarr': {stat[i]: h2hstatarr if h2hstatarr is not None else []},
                            'L5statarr': {stat[i]: L5statarr if L5statarr is not None else []}
                        }
                        
                        print(f"  ✅ NFL specific stat data fetched successfully: H2H={len(h2hstatarr)}, L5={len(L5statarr)}")
                        print(f"    📊 Cache created for {current_player}:")
                        print(f"      Base H2H data: {len(h2harr)} games")
                        print(f"      Base L5 data: {len(L5arr)} games")
                        print(f"      Stat '{stat[i]}' H2H: {len(h2hstatarr)} values")
                        print(f"      Stat '{stat[i]}' L5: {len(L5statarr)} values")
                    
                    request_time = time.time() - request_start_time
                    print(f"  ⏱️ NFL stats fetch completed in {request_time:.2f}s")
                    
                except Exception as e:
                    failed_requests += 1
                    print(f"  ❌ Error fetching NFL stats for {current_player}: {e}")
                    continue
                   
                size = len(h2hstatarr)
                if size == 0:
                    print(f"  ⚠️ H2H stats array is empty for {current_player} - will use L5 data only")
                    # Don't continue - we can still process with L5 data

                # Add performance data to prop
                try:
                    # CRITICAL: Final validation that L5 data exists before scoring
                    if not L5statarr or len(L5statarr) == 0:
                        print(f"❌ CRITICAL ERROR: L5 data is still missing for {current_player} - {stat[i]}")
                        print(f"   This should not happen after our fixes. Debugging info:")
                        print(f"   - L5arr exists: {L5arr is not None}")
                        print(f"   - L5arr length: {len(L5arr) if L5arr else 'None'}")
                        print(f"   - L5statarr: {L5statarr}")
                        print(f"   - Cache state: {player_stats_cache.get(current_player, 'Not in cache')}")
                        continue
                    
                    # Validate data before adding
                    if not h2hstatarr or len(h2hstatarr) == 0:
                        print(f"⚠️ Warning: H2H stats array is empty for {current_player} - {stat[i]}")
                    else:
                        prop.add_performance_data(h2hstatarr, "H2H1Y")
                        print(f"✅ Added H2H performance data: {len(h2hstatarr)} games")
                    
                    if not L5statarr or len(L5statarr) == 0:
                        print(f"⚠️ Warning: L5 stats array is empty for {current_player} - {stat[i]}")
                    else:
                        prop.add_performance_data(L5statarr, "L5")
                        print(f"✅ Added L5 performance data: {len(L5statarr)} games")
                    
                    print(f"✅ Added performance data for {current_player} - {stat[i]} {line[i]}")
                except Exception as e:
                    print(f"⚠️ Error adding performance data for {current_player}: {e}")
                    continue


                # Replace the current NFL scoring section (around line 560-570) with this:

                # Enhanced NFL Scoring System
                if size > 0:
                    temp = sum(1 for val in h2hstatarr if val >= line[i])
                    avg = round(sum(h2hstatarr) / size, 3)
                    diff = round(avg - line[i], 3)
                    rel_diff = round((avg - line[i]) / (line[i] + 5), 3)
                    percent = round(100 * diff / line[i], 3)

                    # Calculate ongoing streak
                    ongoing = 0
                    for val in reversed(h2hstatarr):
                        if val >= line[i]:
                            ongoing += 1
                        else:
                            break
                else:
                    # No H2H data available - use L5 data for scoring
                    print(f"  📊 Using L5-only scoring for {current_player} - no H2H data available")
                    temp = 0
                    avg = 0
                    diff = 0
                    rel_diff = 0
                    percent = 0
                    ongoing = 0

                # Calculate L5 performance metrics
                l5_size = len(L5statarr) if L5statarr else 0
                l5_hit_rate = 0
                l5_avg = 0
                l5_consistency = 0

                print(f"  🔍 L5 Data Check for {current_player} - {stat[i]}:")
                print(f"    L5statarr type: {type(L5statarr)}")
                print(f"    L5statarr length: {l5_size}")
                if L5statarr:
                    print(f"    L5statarr content: {L5statarr}")
                else:
                    print(f"    L5statarr is None/empty")

                if l5_size > 0:
                    try:
                        l5_hits = sum(1 for val in L5statarr if val >= line[i])
                        l5_hit_rate = l5_hits / l5_size
                        l5_avg = sum(L5statarr) / l5_size
                        l5_consistency = 1 - (max(L5statarr) - min(L5statarr)) / (max(L5statarr) + 1) if max(L5statarr) > 0 else 0
                        print(f"  📊 L5 metrics calculated: hits={l5_hits}/{l5_size}, avg={l5_avg:.2f}, consistency={l5_consistency:.3f}")
                    except Exception as e:
                        print(f"  ⚠️ Error calculating L5 metrics for {current_player}: {e}")
                        print(f"    Full error: {traceback.format_exc()}")
                        l5_size = 0
                        l5_hit_rate = 0
                        l5_avg = 0
                        l5_consistency = 0
                else:
                    print(f"  ⚠️ L5 stats array is empty for {current_player} - {stat[i]}")
                    print(f"    This means L5 scoring will be 0 for this prop")

                # Enhanced scoring components
                if size > 0:
                    hit_rate_score = (temp / size) * 0.25                    # Base hit rate (25%)
                    streak_score = (ongoing / size) * 0.20                   # Current streak (20%)
                    margin_score = min(rel_diff * 2, 0.10)                   # Margin of victory (10%)
                    sample_size_bonus = min(size / 20, 0.10)                 # Sample size bonus (10%)
                else:
                    # No H2H data - adjust scoring weights to focus on L5 data
                    hit_rate_score = 0                                      # No H2H hit rate available
                    streak_score = 0                                        # No H2H streak available
                    margin_score = 0                                        # No H2H margin available
                    sample_size_bonus = 0                                   # No H2H sample size available
                
                recent_form_score = l5_hit_rate * 0.20                   # Recent form (20%)
                consistency_score = l5_consistency * 0.15                 # Consistency (15%)

                print(f"  📊 Scoring breakdown for {current_player} - {stat[i]}:")
                print(f"    Hit rate score: {hit_rate_score:.4f} (25%)")
                print(f"    Streak score: {streak_score:.4f} (20%)")
                print(f"    Recent form (L5): {recent_form_score:.4f} (20%) - based on L5 hit rate: {l5_hit_rate:.3f}")
                print(f"    Consistency score: {consistency_score:.4f} (15%)")
                print(f"    Margin score: {margin_score:.4f} (10%)")
                print(f"    Sample size bonus: {sample_size_bonus:.4f} (10%)")

                # Base score calculation
                if size > 0:
                    # Normal scoring with H2H data
                    base_score = (
                        hit_rate_score +
                        streak_score +
                        recent_form_score +
                        consistency_score +
                        margin_score +
                        sample_size_bonus
                    )
                else:
                    # L5-only scoring - adjust weights to compensate for missing H2H data
                    base_score = (
                        recent_form_score * 1.5 +      # Increase L5 weight from 20% to 30%
                        consistency_score * 1.5        # Increase consistency weight from 15% to 22.5%
                    )
                    print(f"  📊 L5-only scoring: base_score = {base_score:.4f} (L5-focused)")

                # Odds type adjustment (risk-based scoring)
                odds_multiplier = 1.0
                if current_odds == "goblin":
                    odds_multiplier = 1.15  # Higher risk, higher potential reward
                elif current_odds == "demon":
                    odds_multiplier = 0.90  # Lower risk, lower potential reward

                # Position-based adjustments
                position_multiplier = 1.0
                if position[i] == "QB":
                    position_multiplier = 1.05  # QBs are more predictable
                elif position[i] == "RB":
                    position_multiplier = 1.02  # RBs are moderately predictable
                elif position[i] == "WR":
                    position_multiplier = 0.98  # WRs are less predictable
                elif position[i] == "TE":
                    position_multiplier = 0.95  # TEs are least predictable

                # Final enhanced score
                enhanced_score = round(base_score * odds_multiplier * position_multiplier, 3)

                # Set the enhanced score
                try:
                    prop.score = enhanced_score
                    print(f"✅ Set score for {current_player}: {enhanced_score}")
                except Exception as e:
                    print(f"⚠️ Error setting score for {current_player}: {e}")
                    continue

                # Enhanced row data for better debugging
                row = [
                    current_player, team_name, against_team, stat[i], line[i], current_odds, str(h2hstatarr),
                    temp, size, avg, diff, rel_diff, percent, enhanced_score, game_id
                ]
                col_widths = [max(col_widths[j], len(str(row[j])) + 2) for j in range(len(headers))]

                if current_odds == "standard":
                    data_rows.append(row)
                elif current_odds == "demon":
                    data_rows_demon.append(row)
                elif current_odds == "goblin":
                    data_rows_goblin.append(row)

                print("".join(f"{str(item):<{col_widths[j]}}" for j, item in enumerate(row)))
                print(f"  📋 Final L5 data used for {current_player} - {stat[i]}: {L5statarr}")
                print(f"  🎯 Final score: {enhanced_score} (includes L5 component: {recent_form_score:.4f})")
                
                # Increment processed count
                processed_rows += 1

            except Exception as e:
                print(f"❌ Error processing NFL prop:")
                print(f"   Player: {current_player}")
                print(f"   Stat: {stat[i]}")
                print(f"   Line: {line[i]}")
                print(f"   Team: {team_name}")
                print(f"   Position: {position[i]}")
                print(f"   Against: {against_team}")
                print(f"   Error: {str(e)}")
                print(f"   Traceback: {traceback.format_exc()}")
                print("-" * 80)

        def print_sorted_table(title, rows, sort_idx):
            print(f"\n{title}:\n")
            print("".join(f"{h:<{col_widths[i]}}" for i, h in enumerate(headers)))
            for row in sorted(rows, key=lambda x: x[sort_idx], reverse=True):
                print("".join(f"{str(item):<{col_widths[i]}}" for i, item in enumerate(row)))

        # Final output sorted by score and by game
        print_sorted_table("Final Standard Props (Sorted by Score)", data_rows, 13)
        print_sorted_table("Final Demon Props (Sorted by Score)", data_rows_demon, 13)
        print_sorted_table("Final Goblin Props (Sorted by Score)", data_rows_goblin, 13)

        print_sorted_table("Final Standard Props (Sorted by Game)", data_rows, -1)
        print_sorted_table("Final Demon Props (Sorted by Game)", data_rows_demon, -1)
        print_sorted_table("Final Goblin Props (Sorted by Game)", data_rows_goblin, -1)
        
        # Show processing summary
        print(f"\n📊 NFL Processing Summary:")
        print(f"   Total rows in norm data: {len(norm)}")
        print(f"   Rows processed: {processed_rows}")
        print(f"   Rows skipped (not in filtered props): {skipped_rows}")
        print(f"   Props in filtered list: {len(props)}")
        if len(norm) > 0:
            efficiency = (skipped_rows / len(norm)) * 100
            print(f"   Efficiency: {efficiency:.1f}% of rows were skipped (already processed)")
        
        # Show cache information
        print(f"\n📋 Player Stats Cache Summary:")
        print(f"   Players cached: {len(player_stats_cache)}")
        for player, stats in player_stats_cache.items():
            h2h_count = len(stats.get('h2harr', []))
            l5_count = len(stats.get('L5arr', []))
            stat_types = list(stats.get('h2hstatarr', {}).keys())
            print(f"     {player}: H2H={h2h_count}, L5={l5_count}, Stats={stat_types}")
        
        # 🚀 ENHANCED: Show stats fetching performance
        print(f"\n📡 StatMuse Request Performance:")
        print(f"   Total requests made: {request_count}")
        print(f"   Successful stats fetches: {stats_fetch_success}")
        print(f"   Failed stats fetches: {stats_fetch_failed}")
        print(f"   Failed requests: {failed_requests}")
        if request_count > 0:
            success_rate = (stats_fetch_success / request_count) * 100
            print(f"   Stats fetch success rate: {success_rate:.1f}%")
        
        # Show rate limiting info
        total_time = time.time() - start_time if 'start_time' in locals() else 0
        if total_time > 0:
            avg_request_time = total_time / request_count if request_count > 0 else 0
            print(f"   Average time per request: {avg_request_time:.2f}s")
            print(f"   Total processing time: {total_time:.2f}s")

    
    def start_scheduler(self):
        """Start the background scheduler"""
        print("🚀 Starting enhanced props processor with scheduler...")
        
        # Schedule the processing cycle every 60 minutes
        schedule.every(60).minutes.do(self.run_processing_cycle)
        
        # Run initial cycle
        self.run_processing_cycle()
        
        # Start scheduler in background thread
        def run_scheduler():
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        
        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()
        
        print("📅 Scheduler started - will process every 60 minutes")
        
        try:
            # Keep the main thread alive
            while True:
                time.sleep(10)
        except KeyboardInterrupt:
            print("\n🛑 Shutting down enhanced props processor...")

    def fetch_stats_instant(self, stats_function, description):
        """
        🚀 INSTANT: Fetch stats immediately without retries or delays
        
        This method makes a single request and returns the result immediately.
        """
        try:
            print(f"    📡 Fetching: {description}")
            
            # Make the stats request
            start_time = time.time()
            result = stats_function()
            request_time = time.time() - start_time
            
            print(f"    ✅ {description} completed in {request_time:.2f}s")
            return result
                        
        except Exception as e:
            print(f"    ❌ {description} failed: {e}")
            return None
    

    
    def test_filtering_with_sample_data(self, league_id):
        """Test the filtering system with sample data"""
        print(f"\n🧪 Testing filtering system for league {league_id}...")
        
        # Create sample props for testing
        from prop import Prop
        
        sample_props = [
            Prop(
                player_name="Test Player 1",
                position="PG",
                stat_type="Points",
                line_score=20.5,
                odds_type="standard",
                team_name="Test Team",
                league_id=league_id
            ),
            Prop(
                player_name="Test Player 2", 
                position="SG",
                stat_type="Rebounds",
                line_score=5.5,
                odds_type="goblin",
                team_name="Test Team",
                league_id=league_id
            )
        ]
        
        print(f"Created {len(sample_props)} sample props for testing")
        
        # Test filtering
        filtered_props = self.filter_new_props(sample_props, league_id)
        
        print(f"Test completed: {len(filtered_props)} props would be processed")
        return filtered_props

if __name__ == "__main__":
    processor = EnhancedPropsProcessor()
    
    # Uncomment the line below to test filtering instead of starting scheduler
    # processor.test_filtering_with_sample_data(7)  # Test with NBA
    
    processor.start_scheduler()
