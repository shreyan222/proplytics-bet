
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
import json
from matchup_rankings_helper import assign_matchup_ranks_to_props

class EnhancedPropsProcessor:
    def __init__(self):
        self.uploader = SupabaseUploader()
        self.is_running = False
        
        # Check if we need to set credentials manually
        self.check_and_setup_credentials()
    
    def check_and_setup_credentials(self):
        """Check and setup Supabase credentials if needed"""
        if not self.uploader.enabled:
            # Try to load from .env file first
            self.load_env_file()
            
            # Try to get from environment variables
            env_url = os.environ.get('SUPABASE_URL')
            env_key = os.environ.get('SUPABASE_KEY')
            
            if env_url and env_key:
                self.uploader.update_credentials(env_url, env_key)
            else:
                # Try to reload from environment
                if not self.uploader.reload_from_environment():
                    print("⚠️ No Supabase credentials found. Set SUPABASE_URL and SUPABASE_KEY environment variables.")
    
    def load_env_file(self):
        """Load environment variables from .env file if it exists"""
        try:
            env_file = '.env'
            if os.path.exists(env_file):
                with open(env_file, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, value = line.split('=', 1)
                            os.environ[key.strip()] = value.strip()
                
                # After loading .env, try to reload uploader credentials
                if not self.uploader.reload_from_environment():
                    print("⚠️ Could not update uploader credentials from .env file")
        except Exception as e:
            print(f"Error loading .env file: {e}")
    
    def set_credentials(self, url, key):
        """Manually set Supabase credentials"""
        self.uploader.update_credentials(url, key)
        print("✅ Uploader enabled with manual credentials")
    
    def reload_uploader_credentials(self):
        """Force reload uploader credentials from environment"""
        if self.uploader.reload_from_environment():
            print("✅ Uploader credentials reloaded successfully")
        else:
            print("❌ Failed to reload uploader credentials")
    
        
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
                return set()
            
            # Use the credentials from the uploader
            supabase_url = self.uploader.supabase_url
            supabase_key = self.uploader.supabase_key
            
            if not supabase_url or not supabase_key:
                # Try to get from environment variables as fallback
                supabase_url = os.environ.get('SUPABASE_URL')
                supabase_key = os.environ.get('SUPABASE_KEY')
                
                if not supabase_url or not supabase_key:
                    return set()
            
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
                
                response = requests.get(query_url, headers=headers, params=params)
                
                if response.status_code == 200:
                    batch_props = response.json()
                    if not batch_props:  # No more results
                        break
                    
                    all_props.extend(batch_props)
                    
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
            
            print(f"📊 Found {len(all_props)} existing props in database for league {league_id}")
            return prop_set
                
        except Exception as e:
            print(f"Error checking existing props: {e}")
            return set()
    
    
    
    def test_database_connection(self):
        """Test if we can connect to the Supabase database"""
        try:
            # Get credentials
            supabase_url = self.uploader.supabase_url or os.environ.get('SUPABASE_URL')
            supabase_key = self.uploader.supabase_key or os.environ.get('SUPABASE_KEY')
            
            if not supabase_url or not supabase_key:
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
                print("✅ Database connection successful")
                return True
            else:
                print(f"❌ Database connection failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Database connection error: {e}")
            return False
    
    def check_credentials_status(self):
        """Check and display the status of Supabase credentials"""
        print(f"📊 Uploader enabled: {self.uploader.enabled}")
        print(f"📊 Environment URL: {os.environ.get('SUPABASE_URL', 'Not set')}")
    
    def filter_new_props(self, props, league_id):
        """Filter out props that already exist in the database"""
        # Get existing props from database
        existing_props = self.get_existing_props_from_database(league_id)
        
        # If we can't get existing props, treat all as new
        if not existing_props:
            return props
        
        new_props = []
        skipped_count = 0
        
        for prop in props:
            prop_key = f"{prop.player_name}|{prop.stat_type}|{prop.line_score}|{prop.odds_type}|{prop.team_name}|{prop.league_id}"
            if prop_key in existing_props:
                skipped_count += 1
            else:
                new_props.append(prop)
        
        print(f"📊 Filtered: {len(new_props)} new, {skipped_count} existing props")
        
        return new_props
    
    



    def create_comprehensive_game_mapping(self, original_df, league_name=""):
        """
        Create comprehensive game mapping from ALL props data (before filtering)
        This ensures we capture all teams for each game ID, including those removed by filtering
        """
        # Get all unique game IDs and their associated teams
        game_team_map = original_df.groupby("Game ID")["Team Name"].unique().to_dict()
        against_team_map = {}
        
        # Track statistics
        two_team_games = 0
        single_team_games = 0
        multi_team_games = 0
        combo_teams = 0
        
        for game_id, teams in game_team_map.items():
            teams_list = list(teams)  # Convert to list for easier handling
            
            # Handle combo props (teams with "/")
            clean_teams = []
            for team in teams_list:
                if "/" in team:
                    against_team_map[game_id] = against_team_map.get(game_id, {})
                    against_team_map[game_id][team] = team  # Combo maps to itself
                    combo_teams += 1
                else:
                    clean_teams.append(team)
            
            # Process non-combo teams
            if len(clean_teams) == 2:
                # Two teams in same game - they play against each other
                team1, team2 = clean_teams[0], clean_teams[1]
                against_team_map[game_id] = against_team_map.get(game_id, {})
                against_team_map[game_id][team1] = team2
                against_team_map[game_id][team2] = team1
                two_team_games += 1
            elif len(clean_teams) == 1:
                # Only one team found - use fallback method
                team_name = clean_teams[0]
                try:
                    if league_name == "NFL":
                        opponent = dataFinder.against_team_nfl(team_name)
                    else:
                        opponent = dataFinder.against_team(team_name)
                    against_team_map[game_id] = against_team_map.get(game_id, {})
                    against_team_map[game_id][team_name] = opponent
                    single_team_games += 1
                except Exception as e:
                    against_team_map[game_id] = against_team_map.get(game_id, {})
                    against_team_map[game_id][team_name] = "Unknown"
            elif len(clean_teams) > 2:
                # More than 2 teams (shouldn't happen) - log for debugging
                # Create mapping for each team against first opponent found
                against_team_map[game_id] = against_team_map.get(game_id, {})
                for team in clean_teams:
                    other_teams = [t for t in clean_teams if t != team]
                    against_team_map[game_id][team] = other_teams[0] if other_teams else "Unknown"
                multi_team_games += 1
        
        print(f"📊 {league_name} Game Mapping: {len(against_team_map)} games, {two_team_games} two-team, {single_team_games} single-team")
        
        return against_team_map
    
    def show_processing_efficiency(self, total_props, new_props, league_name):
        """Show processing efficiency statistics"""
        skipped = total_props - new_props
        if total_props > 0:
            efficiency = (skipped / total_props) * 100
            print(f"📊 {league_name}: {new_props} new, {skipped} existing ({efficiency:.1f}% efficiency)")
    
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

    def load_nfl_matchup_rankings(self):
        """Load NFL matchup rankings from generated file"""
        try:
            with open('nfl_generated_matchup_rankings.json', 'r') as f:
                data = json.load(f)
            print(f"✅ Loaded NFL matchup rankings for {len(data['team_rankings'])} teams")
            return data['team_rankings']
        except FileNotFoundError:
            print("⚠️ NFL matchup rankings not found. Run generate_nfl_rankings.py first.")
            return {}
        except Exception as e:
            print(f"❌ Error loading NFL matchup rankings: {e}")
            return {}
    
    def get_prop_matchup_rank(self, prop, matchup_rankings):
        """Get matchup rank for a specific prop
        
        Args:
            prop: Prop object with player, stat, team, and against_team info
            matchup_rankings: Dictionary of team rankings from NFL scraper
            
        Returns:
            Integer rank 1-32 (1 = best matchup, 32 = worst matchup)
        """
        if not matchup_rankings or not hasattr(prop, 'against_team') or not prop.against_team:
            print(f"⚠️ Default rank 16: matchup_rankings={bool(matchup_rankings)}, has_against_team={hasattr(prop, 'against_team')}, against_team_value={getattr(prop, 'against_team', 'NOT_SET')}")
            return 16  # Default middle rank
        
        team_name = prop.against_team
        position = getattr(prop, 'position', 'Unknown')
        stat_type = prop.stat_type
        
        # Handle "Unknown" or combo teams
        if team_name == "Unknown" or "/" in team_name:
            print(f"⚠️ Default rank 16 for {prop.player_name}: team_name='{team_name}' (Unknown or combo)")
            return 16  # Default middle rank
        
        # Check if team exists in rankings
        if team_name not in matchup_rankings:
            print(f"⚠️ Default rank 16 for {prop.player_name}: team '{team_name}' not found in rankings")
            print(f"   Available teams: {list(matchup_rankings.keys())[:5]}...")
            return 16
        
        team_data = matchup_rankings[team_name]
        
        # Map positions for NFL
        position_mapping = {
            'QB': 'QB',
            'RB': 'RB', 
            'WR': 'WR',
            'TE': 'TE',
            'K': 'K',
            'DEF': 'DEF'
        }
        
        mapped_position = position_mapping.get(position, 'RB')  # Default to RB if unknown
        
        # Check if position exists in team data
        if mapped_position not in team_data:
            print(f"⚠️ Default rank 16 for {prop.player_name}: position '{mapped_position}' not found for team '{team_name}'")
            print(f"   Available positions: {list(team_data.keys())}")
            return 16
        
        position_stats = team_data[mapped_position]
        
        # Map stat types to ranking categories
        stat_mapping = {
            # Rushing stats
            'Rush Yards': 'Rush Yards',
            'Rushing Yards': 'Rush Yards', 
            'Rush Attempts': 'Rush Attempts',
            'Rush TDs': 'Rush TDs',
            'Rushing TDs': 'Rush TDs',
            
            # Receiving stats
            'Receiving Yards': 'Receiving Yards',
            'Rec Yards': 'Receiving Yards',
            'Receptions': 'Receptions',
            'Rec TDs': 'Rec TDs',
            'Receiving TDs': 'Rec TDs',
            
            # Passing stats
            'Passing Yards': 'Passing Yards',
            'Pass Yards': 'Passing Yards',
            'Pass TDs': 'Pass TDs',
            'Passing TDs': 'Pass TDs',
            'Pass Completions': 'Pass Completions',
            'Pass Attempts': 'Pass Attempts',
            
            # Other stats
            'Interceptions': 'Interceptions',
            'Fumbles': 'Fumbles',
            'Sacks': 'Sacks'
        }
        
        # Try to find the stat in position data
        mapped_stat = stat_mapping.get(stat_type, stat_type)
        
        # Try exact match first
        if mapped_stat in position_stats:
            rank = position_stats[mapped_stat]
            print(f"🎯 Found exact match: {prop.player_name} ({mapped_position}) vs {team_name} - {mapped_stat}: {rank}/32")
            return rank
        
        # Try alternative lookups
        alternatives = {
            'Rush Yards': ['Rushing Yards', 'Rush Attempts'],
            'Rushing Yards': ['Rush Yards', 'Rush Attempts'],
            'Rec Yards': ['Receiving Yards', 'Receptions'],
            'Receiving Yards': ['Rec Yards', 'Receptions'],
            'Pass TDs': ['Passing TDs', 'Passing Yards'],
            'Rush TDs': ['Rushing TDs', 'Rush Yards'],
            'Rec TDs': ['Receiving TDs', 'Receiving Yards']
        }
        
        if mapped_stat in alternatives:
            for alt_stat in alternatives[mapped_stat]:
                if alt_stat in position_stats:
                    rank = position_stats[alt_stat]
                    print(f"🎯 Found alternative match: {prop.player_name} ({mapped_position}) vs {team_name} - {alt_stat}: {rank}/32")
                    return rank
        
        # Fallback to any available stat for this position
        if position_stats:
            fallback_stat = list(position_stats.keys())[0]
            rank = position_stats[fallback_stat]
            print(f"🎯 Found fallback match: {prop.player_name} ({mapped_position}) vs {team_name} - {fallback_stat}: {rank}/32")
            return rank
        
        print(f"⚠️ No matchup rank found for {prop.player_name} ({mapped_position}) vs {team_name} - {stat_type}")
        print(f"   Tried mapped_stat: '{mapped_stat}', available stats: {list(position_stats.keys())}")
        print(f"   Using default rank 16")
        return 16  # Default middle rank
    
    def fix_missing_player_names(self, nfl_props, all_props):
        """Fix NFL props with missing player names by cross-referencing picture URLs and player IDs from all props
        
        Args:
            nfl_props: List of NFL Prop objects to fix
            all_props: List of all Prop objects (NBA + NFL) for better matching
            
        Returns:
            List of NFL Prop objects with fixed player names
        """
        print(f"🔧 Fixing missing player names for {len(nfl_props)} NFL props using {len(all_props)} total props...")
        
        # Create mappings from all props that have both identifiers and valid player_name
        picture_url_to_name = {}
        player_id_to_name = {}
        nfl_props_with_names = []
        nfl_props_without_names = []
        
        # First, build mappings from all props
        for prop in all_props:
            picture_url = getattr(prop, 'picture_url', None)
            player_id = getattr(prop, 'player_id', None)
            player_name = getattr(prop, 'player_name', None)
            
            # Only use props that have valid player_name
            if (player_name is not None and 
                str(player_name).lower() not in ['nan', 'none', ''] and 
                str(player_name).strip() != ''):
                
                # Add to picture URL mapping if valid
                if (picture_url is not None and 
                    str(picture_url).lower() not in ['nan', 'none', ''] and 
                    str(picture_url).strip() != ''):
                    picture_url_to_name[str(picture_url)] = player_name
                
                # Add to player ID mapping if valid
                if (player_id is not None and 
                    str(player_id).lower() not in ['nan', 'none', ''] and 
                    str(player_id).strip() != ''):
                    player_id_to_name[str(player_id)] = player_name
        
        # Now categorize NFL props
        for prop in nfl_props:
            player_name = getattr(prop, 'player_name', None)
            
            # Check if player_name is NaN, None, or empty
            if (player_name is None or 
                str(player_name).lower() in ['nan', 'none', ''] or 
                str(player_name).strip() == ''):
                nfl_props_without_names.append(prop)
            else:
                nfl_props_with_names.append(prop)
        
        print(f"📊 Found {len(nfl_props_with_names)} NFL props with names, {len(nfl_props_without_names)} NFL props without names")
        print(f"📊 Created {len(picture_url_to_name)} picture URL mappings and {len(player_id_to_name)} player ID mappings from all props")
        
        # Fix NFL props without names using picture URLs first
        fixed_count = 0
        remaining_props = []
        
        for prop in nfl_props_without_names:
            picture_url = getattr(prop, 'picture_url', None)
            fixed = False
            
            # Try picture URL first
            if picture_url is not None and str(picture_url) != 'nan' and str(picture_url).strip() != '':
                picture_url_str = str(picture_url)
                if picture_url_str in picture_url_to_name:
                    prop.player_name = picture_url_to_name[picture_url_str]
                    fixed_count += 1
                    fixed = True
                    print(f"✅ Fixed via Picture URL: {picture_url_str[:50]}... -> {prop.player_name}")
                else:
                    print(f"⚠️ No picture URL match found for {picture_url_str[:50]}...")
            
            # If not fixed by picture URL, add to remaining props for player ID check
            if not fixed:
                remaining_props.append(prop)
        
        print(f"🔧 Fixed {fixed_count} NFL props using picture URLs")
        
        # Fix remaining props using player IDs
        player_id_fixed_count = 0
        for prop in remaining_props:
            player_id = getattr(prop, 'player_id', None)
            
            if player_id is not None and str(player_id) != 'nan' and str(player_id).strip() != '':
                player_id_str = str(player_id)
                if player_id_str in player_id_to_name:
                    prop.player_name = player_id_to_name[player_id_str]
                    player_id_fixed_count += 1
                    print(f"✅ Fixed via Player ID: {player_id} -> {prop.player_name}")
                else:
                    print(f"⚠️ No player ID match found for {player_id}")
            else:
                print(f"⚠️ NFL prop has no valid player ID")
        
        total_fixed = fixed_count + player_id_fixed_count
        print(f"🔧 Total fixed: {total_fixed}/{len(nfl_props_without_names)} NFL props (Picture URL: {fixed_count}, Player ID: {player_id_fixed_count})")
        
        return nfl_props

    def auto_upload_and_filter_props(self, props, league_name="", game_mapping=None):
        """Automatically upload props with specific stat types and return filtered props for analysis
        
        Args:
            props: List of Prop objects
            league_name: "NFL" or "NBA" for context
            game_mapping: Dictionary mapping game IDs to team matchups
            
        Returns:
            tuple: (props_to_analyze, props_auto_uploaded)
        """
        # Define stat types that should be auto-uploaded without analysis
        auto_upload_stat_types = [
            "Fantasy Score",
            "Yards on First Rush Attempt",
            "Shortest FG Made Yds (Combo)",
            "Qtrs w/5+ Rush Yards",
            "Rush+Rec Yds (Combo)",
            "Longest FG Made Yds (Combo)",
            "Field Goal Yards (Combo)",
            "Longest Completion",
            "Qtrs w/1+ Rec",
            "Longest Rush",
            "Qtrs w/25+ Pass Yds",
            "Punts",
            "Longest Reception",
            "Yds First Rec",
            "Receiving Yards in First 2 Receptions",
            "Rush Yards in First 5 Attempts",
            "Comp in F10 Pass Attempts",
            "Qtrs w/5+ Rec Yards",
            "Halves w/100+ Pass Yds",
            "Halves w/25+ Rec Yds",
            "Halves w/25+ Rush Yds",
            "Passing Yards in First 10 Attempts",
            "Qtrs w/10+ Rec Yds",
            "Qtrs w/20+ Rush Yds",
            "Qtrs w/50+ Pass Yds",
            "Yards on First Pass Completion"
        ]
        
        # Separate props into those for analysis and those for auto-upload
        props_to_analyze = []
        props_auto_upload = []
        
        for prop in props:
            stat_type = getattr(prop, 'stat_type', '')
            if stat_type in auto_upload_stat_types:
                # Set against_team for auto-upload props using game mapping
                team_name = prop.team_name
                game_id = getattr(prop, 'game_id', None)
                against_team = "Unknown"
                
                # Use the same team mapping logic as in the main processors
                if "/" in team_name:
                    against_team = team_name  # Combo maps to itself
                    print(f"🔀 Auto-upload combo prop: {team_name}")
                elif game_mapping and game_id in game_mapping:
                    against_team = game_mapping[game_id].get(team_name, "Unknown")
                    if against_team != "Unknown":
                        print(f"✅ Auto-upload team mapped: {team_name} vs {against_team}")
                    else:
                        print(f"⚠️ Auto-upload team mapping failed: {team_name} not found in game {game_id}")
                else:
                    print(f"⚠️ Auto-upload: Game ID {game_id} not found in game_mapping")
                
                # Set basic properties for auto-upload props
                prop.against_team = against_team
                prop.matchup_rank = 16  # Default middle rank
                prop.score = 0  # No analysis score
                
                # Add empty performance data to indicate no analysis was done
                prop.add_performance_data([], "H2H1Y")
                prop.add_performance_data([], "L5")
                
                props_auto_upload.append(prop)
            else:
                props_to_analyze.append(prop)
        
        print(f"🚀 Auto-upload separation for {league_name}:")
        print(f"   Props to analyze: {len(props_to_analyze)}")
        print(f"   Props to auto-upload: {len(props_auto_upload)}")
        
        # Upload the auto-upload props immediately
        if props_auto_upload:
            print(f"📤 Auto-uploading {len(props_auto_upload)} {league_name} props with unsupported stat types...")
            success = self.uploader.upload_with_retry(props_auto_upload, metadata={
                'auto_upload': True,
                'reason': 'unsupported_stat_types',
                'league': league_name,
                'timestamp': datetime.now().isoformat(),
                'stat_types': list(set(prop.stat_type for prop in props_auto_upload))
            })
            
            if success:
                print(f"✅ Successfully auto-uploaded {len(props_auto_upload)} {league_name} props")
            else:
                print(f"❌ Failed to auto-upload {len(props_auto_upload)} {league_name} props")
        
        return props_to_analyze, props_auto_upload

    def assign_matchup_ranks_to_props(self, props, league_name=""):
        """Assign matchup ranks to all props based on their stat type and opponent
        
        Args:
            props: List of Prop objects
            league_name: "NFL" or "NBA" (only NFL supported currently)
        """
        print(f"🎯 assign_matchup_ranks_to_props called with {len(props)} {league_name} props")
        
        if league_name != "NFL":
            print(f"⚠️ League {league_name} not supported for matchup ranks, defaulting to N/A")
            for prop in props:
                prop.matchup_rank = 'N/A'  # Default middle rank
            return
        
        # Load NFL matchup rankings
        matchup_rankings = self.load_nfl_matchup_rankings()
        
        if not matchup_rankings:
            print("⚠️ No matchup rankings loaded, defaulting all to 16")
            for prop in props:
                prop.matchup_rank = 16
            return
        
        print(f"✅ Loaded matchup rankings for {len(matchup_rankings)} teams")
        
        rank_stats = {}
        for prop in props:
            rank = self.get_prop_matchup_rank(prop, matchup_rankings)
            prop.matchup_rank = rank
            
            # Track statistics
            if rank not in rank_stats:
                rank_stats[rank] = 0
            rank_stats[rank] += 1
        
        # Show statistics
        great_matchups = sum(count for rank, count in rank_stats.items() if rank <= 8)
        good_matchups = sum(count for rank, count in rank_stats.items() if 9 <= rank <= 16)
        fair_matchups = sum(count for rank, count in rank_stats.items() if 17 <= rank <= 24)
        poor_matchups = sum(count for rank, count in rank_stats.items() if rank >= 25)
        
        print(f"📊 {league_name} Matchup Ranks: Great({great_matchups}) Good({good_matchups}) Fair({fair_matchups}) Poor({poor_matchups})")

    def run_processing_cycle(self):
        """Run a complete processing cycle"""
        if self.is_running:
            return
            
        self.is_running = True
        start_time = time.time()
        
        try:
            # Load your existing data
            df = pd.read_csv('Testing.csv')
            
            # Process NBA props
            nba_props = self.load_props_from_file('nba_props.pkl')
            nfl_props = self.load_props_from_file('nfl_props.pkl')
            all_props = self.load_props_from_file('all_props.pkl')
            # Combine all props for better name matching
            
            
            # Process NBA data
            nba_original = PPnbapicks.filter_rows_by_league_id(df, 7)  # Keep original for mapping
            nba_norm1 = PPnbapicks.RemoveSearch(nba_original.copy(), "Combo")
            
            if not nba_norm1.empty:
                nba_norm2 = PPnbapicks.RemoveSearch(nba_norm1, "Dunks")
                nba_norm = PPnbapicks.RemoveSearch(nba_norm2, "Fantasy Score")
                
                if not nba_norm.empty:
                    nba_norm['Display Name'] = nba_norm['Display Name'].apply(unidecode)
                    
                    pd.set_option('display.max_rows', None)
                    pd.set_option('display.max_columns', None)
                    pd.set_option('display.width', None)
                    pd.set_option('display.max_colwidth', None)
                    
                    # Create comprehensive game mapping from ORIGINAL unfiltered data
                    nba_game_mapping = self.create_comprehensive_game_mapping(nba_original, "NBA")
                    
                    # Filter out props that already exist in database
                    new_nba_props = self.filter_new_props(nba_props, 7)
                    
                    if new_nba_props:
                        self.show_processing_efficiency(len(nba_props), len(new_nba_props), "NBA")
                        
                        # Auto-upload props with unsupported stat types and filter remaining props
                        props_to_analyze, props_auto_uploaded = self.auto_upload_and_filter_props(new_nba_props, "NBA", nba_game_mapping)
                        
                        if props_to_analyze:
                            # Assign matchup ranks to NBA props that will be analyzed
                            self.assign_matchup_ranks_to_props(props_to_analyze, "NBA")
                            
                            # Process NBA data with your existing algorithms (only analyzed props)
                            self.nba_processing(0, "since-2023-2024-season", props_to_analyze, nba_norm, nba_game_mapping)
                            self.nba_processing(0, "since-2024-2025-season", props_to_analyze, nba_norm, nba_game_mapping)
                            
                            # Combine analyzed and auto-uploaded props for final processing
                            new_nba_props = props_to_analyze + props_auto_uploaded
                        else:
                            print("ℹ️ No NBA props to analyze (all were auto-uploaded)")
                            new_nba_props = props_auto_uploaded
                        
                        # Save updated NBA props
                        with open('nba_props.pkl', 'wb') as f:
                            pickle.dump(nba_props, f)
                        
                        # Filter out props that don't have analysis data before upload (only for analyzed props)
                        if props_to_analyze:
                            analyzed_props = []
                            unanalyzed_count = 0
                            
                            for prop in props_to_analyze:
                                h2h_data = getattr(prop, 'H2H1Y', []) or getattr(prop, 'H2H2Y', [])
                                l5_data = getattr(prop, 'L5', [])
                                    
                                if h2h_data or l5_data:  # Has some analysis data
                                    analyzed_props.append(prop)
                                else:
                                    unanalyzed_count += 1
                            
                            if unanalyzed_count > 0:
                                print(f"ℹ️ {unanalyzed_count} props without analysis data will still be uploaded")
                            
                            # Upload ALL props to Supabase (auto-uploaded props were already uploaded)
                            if props_to_analyze:
                                success = self.uploader.upload_with_retry(props_to_analyze, metadata={
                                    'processing_time_seconds': time.time() - start_time,
                                    'total_props': len(props_to_analyze),
                                    'analyzed_props': len(analyzed_props),
                                    'unanalyzed_props': unanalyzed_count,
                                    'auto_uploaded_props': len(props_auto_uploaded),
                                    'existing_props_skipped': len(nba_props) - len(new_nba_props),
                                    'league': 'NBA',
                                    'timestamp': datetime.now().isoformat()
                                })
                            else:
                                print("ℹ️ No NBA props to upload (all were auto-uploaded)")
                        else:
                            print("ℹ️ No NBA props were analyzed (all were auto-uploaded)")
                    else:
                        self.show_processing_efficiency(len(nba_props), 0, "NBA")
            
            # Process NFL data
            nfl_original = PPnbapicks.filter_rows_by_league_id(df, 9)  # Keep original for mapping
            nfl_norm = nfl_original.copy()  # NFL doesn't filter as much initially
            
            if not nfl_norm.empty:
                # Create comprehensive game mapping from ORIGINAL unfiltered data
                nfl_game_mapping = self.create_comprehensive_game_mapping(nfl_original, "NFL")
                
                # Filter out props that already exist in database
                new_nfl_props = self.filter_new_props(nfl_props, 9)
                
                if new_nfl_props:
                    self.show_processing_efficiency(len(nfl_props), len(new_nfl_props), "NFL")
                    
                    # Fix missing player names BEFORE processing using all props for better matching
                    new_nfl_props = self.fix_missing_player_names(new_nfl_props, all_props)
                    
                    # Auto-upload props with unsupported stat types and filter remaining props
                    props_to_analyze, props_auto_uploaded = self.auto_upload_and_filter_props(new_nfl_props, "NFL", nfl_game_mapping)
                    
                    if props_to_analyze:
                        # Process NFL data (only analyzed props) - this sets against_team
                        self.nfl_processing(0, nfl_norm, props_to_analyze, nfl_game_mapping)
                        
                        # Assign matchup ranks to NFL props AFTER against_team is set
                        self.assign_matchup_ranks_to_props(props_to_analyze, "NFL")
                        
                        # Combine analyzed and auto-uploaded props for final processing
                        new_nfl_props = props_to_analyze + props_auto_uploaded
                    else:
                        print("ℹ️ No NFL props to analyze (all were auto-uploaded)")
                        new_nfl_props = props_auto_uploaded
                    
                    # Save updated NFL props
                    with open('nfl_props.pkl', 'wb') as f:
                        pickle.dump(nfl_props, f)
                    
                    # Filter out props that don't have analysis data before upload (only for analyzed props)
                    if props_to_analyze:
                        analyzed_props = []
                        unanalyzed_count = 0
                        
                        for prop in props_to_analyze:
                            h2h_data = getattr(prop, 'H2H1Y', []) or getattr(prop, 'H2H2Y', [])
                            l5_data = getattr(prop, 'L5', [])
                            
                            if h2h_data or l5_data:  # Has some analysis data
                                analyzed_props.append(prop)
                            else:
                                unanalyzed_count += 1
                        
                        if unanalyzed_count > 0:
                            print(f"ℹ️ {unanalyzed_count} props without analysis data will still be uploaded")
                        
                        # Upload ALL props to Supabase (auto-uploaded props were already uploaded)
                        if props_to_analyze:
                            success = self.uploader.upload_with_retry(props_to_analyze, metadata={
                                'processing_time_seconds': time.time() - start_time,
                                'total_props': len(props_to_analyze),
                                'analyzed_props': len(analyzed_props),
                                'unanalyzed_props': unanalyzed_count,
                                'auto_uploaded_props': len(props_auto_uploaded),
                                'existing_props_skipped': len(nfl_props) - len(new_nfl_props),
                                'league': 'NFL',
                                'timestamp': datetime.now().isoformat()
                            })
                        else:
                            print("ℹ️ No NFL props to upload (all were auto-uploaded)")
                    else:
                        print("ℹ️ No NFL props were analyzed (all were auto-uploaded)")
                else:
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
    
    def nba_processing(self, num, timeframe, props, norm, game_mapping=None):
        # Track processing start time for performance metrics
        self._processing_start_time = time.time()
        
        output_file = "output_data.csv"
        global h2harr, current_player, current_prop, L5arr, h2hstatarr
        
        # Get unique teams from props instead of CSV
        unique_teams = list(set(prop.team_name for prop in props))
        prop_counts = {}
        for prop in props:
            prop_counts[prop.odds_type] = prop_counts.get(prop.odds_type, 0) + 1
        num_goblin = prop_counts.get("goblin", 0)
        num_demon = prop_counts.get("demon", 0)
        num_standard = prop_counts.get("standard", 0)

        # Use the comprehensive game mapping passed from main processing
        if game_mapping is None:
            against_team_map = self.create_comprehensive_game_mapping(norm, "NBA")
        else:
            against_team_map = game_mapping

        unique_teams = norm["Team Name"].unique()
        position_cache = self.fetch_all_team_positions(unique_teams)
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
        
        # OPTIMIZED: Only process rows that have corresponding props in our filtered list
        # Create a mapping from norm data to props for efficient lookup
        norm_to_prop_map = {}
        for prop in props:
            # Create a key that matches the norm data structure
            prop_key = (prop.player_name, prop.stat_type, prop.line_score, prop.odds_type)
            norm_to_prop_map[prop_key] = prop
        
        # Track which rows we actually process
        processed_props = 0
        skipped_props = 0
        
        # Track stats fetching for debugging
        request_count = 0
        failed_requests = 0
        stats_fetch_success = 0
        stats_fetch_failed = 0
        
        # Enhanced debugging counters
        player_name_errors = 0
        h2h_fetch_failures = 0
        h2hstat_fetch_failures = 0
        team_mapping_failures = 0
        data_availability_issues = 0
        
        previous_player = None
        previous_stat = None
        
        # Initialize cache variables for optimization
        cached_h2h_data = None
        cached_stat_data = None
        
        # Sort props by player name to optimize caching
        props_sorted = sorted(props, key=lambda p: (p.player_name or "", p.stat_type or ""))
        print(f"🔄 Processing {len(props_sorted)} props (sorted by player for optimization)")
        
        for i, prop in enumerate(props_sorted):
            try:
                current_player = prop.player_name
                current_prop = f"{prop.stat_type} over {prop.line_score}"

                # Enhanced player name validation with debugging
                if (current_player is None or 
                    str(current_player).lower() in ['nan', 'none', ''] or 
                    str(current_player).strip() == ''):
                    print(f"⚠️ SKIP: Missing player name - {prop.stat_type} {prop.line_score} ({prop.odds_type})")
                    player_name_errors += 1
                    skipped_props += 1
                    continue

                # Normalize player name for better matching
                current_player = str(current_player).strip()
                
                # Print every prop being analyzed with more context
                print(f"🔍 [{i+1}/{len(props_sorted)}] Analyzing: {current_player} - {prop.stat_type} {prop.line_score} ({prop.odds_type})")

                team_name = prop.team_name
                game_id = getattr(prop, 'game_id', None)
                
                # Enhanced team mapping with debugging
                against_team = "Unknown"
                if "/" in team_name:
                    against_team = team_name  # Combo maps to itself
                    print(f"🔀 Combo prop detected: {team_name}")
                elif game_id in against_team_map:
                    against_team = against_team_map[game_id].get(team_name, "Unknown")
                    if against_team == "Unknown":
                        print(f"⚠️ Team mapping failed: {team_name} not found in game {game_id}")
                        team_mapping_failures += 1
                    else:
                        print(f"✅ Team mapped: {team_name} vs {against_team} (Game: {game_id})")
                else:
                    print(f"⚠️ Game ID {game_id} not found in against_team_map")
                    team_mapping_failures += 1
                
                prop.against_team = against_team
                
                # Use start_time from prop if available
                if not hasattr(prop, 'start_time') or prop.start_time is None:
                    prop.start_time = "2025-06-18T22:00:00Z"

                position = position_cache.get(current_player, "Unknown")

                # Track request timing
                request_start_time = time.time()
                request_count += 1
                
                # Enhanced stats fetching with optimized caching
                h2harr = None
                h2hstatarr = None
                
                try:
                    # Fetch H2H data (only when player changes)
                    if i == 0 or current_player != previous_player:
                        print(f"🔄 Fetching H2H data: {current_player} vs {against_team} ({timeframe})")
                        
                        try:
                            h2harr = self.fetch_stats_instant(
                                lambda: dataFinder.stats_against_team_t_season(current_player, against_team, timeframe),
                                f"H2H stats for {current_player} vs {against_team}"
                            )
                            if h2harr:
                                print(f"✅ H2H data fetched: {len(h2harr)} games")
                                stats_fetch_success += 1
                                # Cache the H2H data for the current player
                                cached_h2h_data = h2harr
                            else:
                                print(f"❌ FAIL: No H2H data for {current_player} vs {against_team}")
                                h2h_fetch_failures += 1
                                stats_fetch_failed += 1
                                skipped_props += 1
                                continue
                        except Exception as h2h_e:
                            print(f"❌ H2H fetch failed: {str(h2h_e)}")
                            h2h_fetch_failures += 1
                            stats_fetch_failed += 1
                            skipped_props += 1
                            continue
                    else:
                        print(f"📋 Using cached H2H data for {current_player}")
                        h2harr = cached_h2h_data  # Use cached data
                    
                    # Fetch specific stat data (only when stat type changes)
                    if i == 0 or prop.stat_type != previous_stat:
                        print(f"🎯 Extracting {prop.stat_type} from H2H data")
                        
                        try:
                            h2hstatarr = self.fetch_stats_instant(
                                lambda: dataFinder.specific_stat_vs_opp_games_arr(h2harr, prop.stat_type),
                                f"Specific stat {prop.stat_type} for {current_player}"
                            )
                            if h2hstatarr:
                                print(f"✅ Stat data extracted: {len(h2hstatarr)} values - {h2hstatarr}")
                                # Cache the stat data for the current stat type
                                cached_stat_data = h2hstatarr
                            else:
                                print(f"❌ FAIL: Could not extract {prop.stat_type} from H2H data")
                                h2hstat_fetch_failures += 1
                                skipped_props += 1
                                continue
                        except Exception as stat_e:
                            print(f"❌ Stat extraction error: {str(stat_e)}")
                            h2hstat_fetch_failures += 1
                            skipped_props += 1
                            continue
                    else:
                        print(f"📋 Using cached stat data for {prop.stat_type}")
                        h2hstatarr = cached_stat_data  # Use cached data
                    
                    request_time = time.time() - request_start_time
                    print(f"⏱️ Data fetch completed in {request_time:.2f}s")
                    
                except Exception as e:
                    print(f"❌ CRITICAL: Stats fetch failed for {current_player} - {prop.stat_type}: {str(e)}")
                    failed_requests += 1
                    skipped_props += 1
                    continue

                h2hsize = len(h2hstatarr)
                if h2hsize == 0:
                    print(f"⚠️ SKIP: Empty stat array for {current_player} - {prop.stat_type}")
                    data_availability_issues += 1
                    skipped_props += 1
                    continue
                    
                print(f"📊 Sample size: {h2hsize} games")
                
                if timeframe == "since-2024-2025-season":
                    prop.add_performance_data(h2hstatarr, "H2H1Y")
                elif timeframe == "since-2023-2024-season":
                    prop.add_performance_data(h2hstatarr, "H2H2Y")

                L5temp = 0
                h2htemp = 0
                h2hinjury = 0
                for j in range(num, h2hsize):
                    if h2hstatarr[j] >= prop.line_score:
                        h2htemp += 1
                    elif h2hinjury < 1 and dataFinder.specific_stat_vs_opp_games_arr(h2harr, "Min")[j] < 20:
                        h2hinjury += 1
                    elif prop.stat_type not in ["Blks+Stls", "Steals", "Blocked Shots", "Turnovers"]:
                        if h2hstatarr[j] + 1 >= prop.line_score:
                            h2htemp += 0.5
                if h2hsize == 0:
                    h2hsize = 1
                h2htemp = h2htemp + h2hinjury
                h2hscore.append(h2htemp / h2hsize)

                if prop.odds_type == "goblin":
                    threshold = 0.875
                else:
                    threshold = 0.75

                h2h_success_rate = h2htemp / h2hsize
                h2h_avg = sum(h2hstatarr) / len(h2hstatarr) if h2hstatarr else 0
                
                print(f"🎯 H2H Analysis: {h2htemp}/{h2hsize} hits ({h2h_success_rate:.3f}), avg: {h2h_avg:.2f}, line: {prop.line_score}")

                # ALWAYS fetch L5 data regardless of H2H threshold
                print(f"🔄 Fetching L5 data for {current_player}...")
                
                try:
                    L5arr = dataFinder.stats_ten_games(current_player)
                    if not L5arr:
                        print(f"❌ No L10 data available for {current_player}")
                        skipped_props += 1
                        continue
                        
                    L5statarr = dataFinder.specific_stat_l10_games(L5arr, prop.stat_type)
                    L5statarr = L5statarr[-5:]  # Take last 5 games
                    L5size = len(L5statarr)
                    
                    if L5size == 0:
                        print(f"❌ No L5 stat data for {current_player} - {prop.stat_type}")
                        skipped_props += 1
                        continue
                        
                    print(f"📊 L5 data: {L5statarr}")
                    prop.add_performance_data(L5statarr, "L5")
                    
                    for j in range(num, L5size):
                        if L5statarr[j] >= prop.line_score:
                            L5temp += 1
                        elif prop.stat_type not in ["Blks+Stls", "Steals", "Blocked Shots", "Turnovers"]:
                            if L5statarr[j] + 1 >= prop.line_score:
                                L5temp += 0.5
                                
                    if L5size == 0:
                        L5size = 1
                    L5score.append(L5temp / L5size)
                    L5avg = round(sum(L5statarr) / 5, 3)
                    L5diff = round(L5avg - prop.line_score, 3)
                    L5relative_diff = round((L5avg - prop.line_score) / (prop.line_score + 5), 3)
                    L5percent = round(100 * (sum(L5statarr) / 5 - prop.line_score) / prop.line_score, 3)

                    print(f"🎯 L5 Analysis: {L5temp}/{L5size} hits ({L5temp/L5size:.3f}), avg: {L5avg}")

                except Exception as l5_e:
                    print(f"❌ L5 data fetch failed: {str(l5_e)}")
                    skipped_props += 1
                    continue

                # Calculate H2H metrics
                h2havg = round(sum(h2hstatarr) / len(h2hstatarr), 3)
                h2hdiff = round(h2havg - prop.line_score, 3)
                h2hrelative_diff = round((h2havg - prop.line_score) / (prop.line_score + 5), 3)
                h2hpercent = round(100 * (sum(h2hstatarr) / len(h2hstatarr) - prop.line_score) / prop.line_score, 3)
                sample_size = h2hsize
                
                # Calculate sorting score (always calculate, regardless of H2H threshold)
                sorting_score = (
                        (h2htemp / h2hsize) * 0.45 +
                        (h2hrelative_diff * 0.20) +
                        (sample_size * 0.20) +
                        (L5temp / 5) * 0.1 +
                        (L5relative_diff * 0.05)
                )
                sorting_score = round(sorting_score, 3)
                
                # ESSENTIAL DEBUG: Print prop analysis results
                print(f"📊 FINAL: {current_player} ({prop.stat_type} {prop.line_score}): H2H={h2hstatarr}, L5={L5statarr}, vs={against_team}, score={sorting_score}")
                
                row = [
                    current_player,
                    getattr(prop, 'position', 'Unknown'),
                    prop.team_name,
                    against_team,
                    prop.stat_type,
                    prop.line_score,
                    prop.odds_type,
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
                    game_id
                ]
                if prop.odds_type == "standard":
                    data_rows.append(row)
                elif prop.odds_type == "demon":
                    data_rows_demon.append(row)
                elif prop.odds_type == "goblin":
                    data_rows_goblin.append(row)
                col_widths = [max(col_widths[i], len(str(row[i])) + 2) for i in range(len(headers))]

                if len(row) != len(col_widths):
                    print(f"⚠️ Row length mismatch: expected {len(col_widths)}, got {len(row)}")
                else:
                    formatted_row = "".join(f"{str(item):<{col_widths[i]}}" for i, item in enumerate(row))

                # Increment processed count
                processed_props += 1
                print(f"✅ Successfully processed prop {processed_props}")
                
                # Log H2H threshold status for reference (but don't skip)
                if h2h_success_rate >= threshold and h2h_avg - prop.line_score >= 0:
                    print(f"✅ Passed H2H threshold ({threshold})")
                else:
                    print(f"⚠️ Did not pass H2H threshold ({threshold}) - success rate: {h2h_success_rate:.3f}, avg diff: {h2h_avg - prop.line_score:.2f} - but still processed")

                # Update previous values for caching optimization
                previous_player = current_player
                previous_stat = prop.stat_type

            except Exception as e:
                print(f"❌ CRITICAL ERROR processing prop {i+1}: {current_player} - {prop.stat_type}: {str(e)}")
                import traceback
                traceback.print_exc()
                failed_requests += 1
                skipped_props += 1
                continue

        # Save data to CSV
        try:
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

            print(f"📁 Data saved to {output_file}")
        except Exception as e:
            print(f"❌ Error saving to CSV: {str(e)}")

        # Sort results
        ssrownum = 17
        gamerownum = ssrownum + 1
        data_rows.sort(key=lambda row: (row[ssrownum]), reverse=True)
        data_rows_demon.sort(key=lambda row: (row[ssrownum]), reverse=True)
        data_rows_goblin.sort(key=lambda row: (row[ssrownum]), reverse=True)
        
        data_rows.sort(key=lambda row: row[gamerownum])
        data_rows_demon.sort(key=lambda row: row[gamerownum])
        data_rows_goblin.sort(key=lambda row: row[gamerownum])
        
        # Enhanced processing summary with detailed breakdown
        total_props = len(props)
        print(f"\n📊 === NBA PROCESSING SUMMARY ===")
        print(f"Total Props: {total_props}")
        print(f"Successfully Processed: {processed_props}")
        print(f"Skipped Props: {skipped_props}")
        print(f"Success Rate: {(processed_props/total_props)*100:.1f}%")
        print(f"\n🔍 === FAILURE BREAKDOWN ===")
        print(f"Player Name Errors: {player_name_errors}")
        print(f"H2H Fetch Failures: {h2h_fetch_failures}")
        print(f"H2H Stat Extraction Failures: {h2hstat_fetch_failures}")
        print(f"Team Mapping Failures: {team_mapping_failures}")
        print(f"Data Availability Issues: {data_availability_issues}")
        print(f"Total Failed Requests: {failed_requests}")
        print(f"\n⚡ === PERFORMANCE ===")
        print(f"Stats Fetch Success: {stats_fetch_success}")
        print(f"Stats Fetch Failed: {stats_fetch_failed}")
        print(f"Total API Requests: {request_count}")
        processing_time = time.time() - self._processing_start_time
        print(f"Total Processing Time: {processing_time:.2f}s")
        print(f"Average Time Per Prop: {processing_time/total_props:.2f}s")
        print("=" * 40)    
    def nfl_processing(self, num, norm, props, game_mapping=None):
        # Track processing start time for performance metrics
        self._processing_start_time = time.time()
        # Store original norm for reference
        original_norm = norm.copy()
        
        import traceback
        
        # Get prop counts from props instead of CSV
        prop_counts = {}
        for prop in props:
            prop_counts[prop.odds_type] = prop_counts.get(prop.odds_type, 0) + 1
        num_goblin = prop_counts.get("goblin", 0)
        num_demon = prop_counts.get("demon", 0)
        num_standard = prop_counts.get("standard", 0)

        # Use the comprehensive game mapping passed from main processing
        if game_mapping is None:
            against_team_map = self.create_comprehensive_game_mapping(original_norm, "NFL")
        else:
            against_team_map = game_mapping

        headers = ['Name', 'Team', 'AgainstTeam', 'Stat', 'Line', 'Odds', 'Array', 'Temp', 'Size',
                'Avg', 'Diff', 'Rel Diff', 'Percent', 'Score', 'GameId']
        col_widths = [len(h) + 2 for h in headers]
        header_row = "".join(f"{h:<{col_widths[i]}}" for i, h in enumerate(headers))

        data_rows, data_rows_demon, data_rows_goblin = [], [], []
        prop_lookup = {
            (p.player_name, p.stat_type, p.line_score, p.odds_type): p
            for p in props
        }
        
        # OPTIMIZED: Only process rows that have corresponding props in our filtered list
        # Create a mapping from norm data to props for efficient lookup
        norm_to_prop_map = {}
        for prop in props:
            # Create a key that matches the norm data structure
            prop_key = (prop.player_name, prop.stat_type, prop.line_score, prop.odds_type)
            norm_to_prop_map[prop_key] = prop
        
        # Track which rows we actually process
        processed_props = 0
        skipped_props = 0
        
        # Track stats fetching for debugging
        request_count = 0
        failed_requests = 0
        stats_fetch_success = 0
        stats_fetch_failed = 0
        
        # Enhanced debugging counters
        player_name_errors = 0
        h2h_fetch_failures = 0
        l5_fetch_failures = 0
        h2hstat_fetch_failures = 0
        l5stat_fetch_failures = 0
        team_mapping_failures = 0
        data_availability_issues = 0
        performance_data_errors = 0
        
        previous_player = None
        previous_stat = None
        
        # Initialize cache variables for optimization
        cached_h2h_data = None
        cached_l5_data = None
        cached_h2h_stat_data = None
        cached_l5_stat_data = None
        
        # Helper function to determine if prop requires QB rushing data
        def is_qb_rushing_prop(prop):
            """Check if this prop requires QB rushing data (qbrushingprop)"""
            position = getattr(prop, 'position', 'Unknown')
            stat_type = prop.stat_type
            if position == "QB" and stat_type in ["Rush Yards", "Rush TDs", "Rush Attempts", "Rush+Rec TDs", "Rush+Rec Yds", "Pass+Rush Yds"]:
                return True
            return False
        
        # Sort props by player name to optimize potential caching
        props_sorted = sorted(props, key=lambda p: (p.player_name or "", p.stat_type or ""))
        print(f"🔄 Processing {len(props_sorted)} NFL props (sorted by player for optimization)")
        
        for i, prop in enumerate(props_sorted):
            try:
                current_player = prop.player_name
                current_prop = f"{prop.stat_type} over {prop.line_score}"
                team_name = prop.team_name
                game_id = getattr(prop, 'game_id', None)
                current_odds = prop.odds_type

                # Enhanced player name validation with debugging
                if (current_player is None or 
                    str(current_player).lower() in ['nan', 'none', ''] or 
                    str(current_player).strip() == ''):
                    print(f"⚠️ SKIP: Missing player name - {prop.stat_type} {prop.line_score} ({current_odds})")
                    player_name_errors += 1
                    skipped_props += 1
                    continue

                # Normalize player name for better matching
                current_player = str(current_player).strip()

                # Print every prop being analyzed with more context
                print(f"🔍 [{i+1}/{len(props_sorted)}] Analyzing: {current_player} - {prop.stat_type} {prop.line_score} ({current_odds})")

                # Enhanced team mapping with debugging
                against_team = "Unknown"
                if "/" in team_name:
                    against_team = team_name  # Combo maps to itself
                    print(f"🔀 Combo prop detected: {team_name}")
                elif game_id in against_team_map:
                    against_team = against_team_map[game_id].get(team_name, "Unknown")
                    if against_team == "Unknown":
                        print(f"⚠️ Team mapping failed: {team_name} not found in game {game_id}")
                        team_mapping_failures += 1
                    else:
                        print(f"✅ Team mapped: {team_name} vs {against_team} (Game: {game_id})")
                else:
                    print(f"⚠️ Game ID {game_id} not found in against_team_map")
                    team_mapping_failures += 1
                
                prop.against_team = against_team

                # Use start_time from prop if available
                if not hasattr(prop, 'start_time') or prop.start_time is None:
                    prop.start_time = "2025-06-18T22:00:00Z"

                # Track request timing
                request_start_time = time.time()
                request_count += 1
                
                # Enhanced stats fetching with single attempt
                h2harr = []
                L5arr = []
                h2hstatarr = []
                L5statarr = []
                
                try:
                    # Check if this is a QB rushing prop that needs special handling
                    is_qb_rush = is_qb_rushing_prop(prop)
                    
                    # Fetch H2H data (only when player changes OR it's a QB rushing prop)
                    if i == 0 or current_player != previous_player or is_qb_rush:
                        print(f"🔄 Fetching NFL H2H data: {current_player} vs {against_team}" + (" (QB rushing)" if is_qb_rush else ""))
                        
                        try:
                            h2harr = self.fetch_stats_instant(
                                lambda: dataFinder.nflprop(current_player, against_team),
                                f"NFL H2H stats for {current_player} vs {against_team}"
                            )
                            if h2harr:
                                print(f"✅ H2H data fetched: {len(h2harr)} games")
                                stats_fetch_success += 1
                                # Cache the H2H data for the current player
                                cached_h2h_data = h2harr
                            else:
                                print(f"⚠️ H2H data empty for {current_player}")
                                cached_h2h_data = []
                        except Exception as h2h_e:
                            print(f"❌ H2H fetch failed: {str(h2h_e)}")
                            h2h_fetch_failures += 1
                            cached_h2h_data = []
                    else:
                        print(f"📋 Using cached H2H data for {current_player}")
                        h2harr = cached_h2h_data or []
                    
                    # Always ensure h2harr is defined
                    h2harr = h2harr if 'h2harr' in locals() else (cached_h2h_data or [])
                   
                    # Fetch L5 data (only when player changes)
                    if i == 0 or current_player != previous_player:
                        print(f"🔄 Fetching NFL L5 data: {current_player}")
                        
                        try:
                            L5arr = self.fetch_stats_instant(
                                lambda: dataFinder.nflprop_l5(current_player),
                                f"NFL L5 stats for {current_player}"
                            )
                            if L5arr:
                                print(f"✅ L5 data fetched: {len(L5arr)} games")
                                stats_fetch_success += 1
                                # Cache the L5 data for the current player
                                cached_l5_data = L5arr
                            else:
                                print(f"❌ SKIP: No L5 data available for {current_player}")
                                l5_fetch_failures += 1
                                stats_fetch_failed += 1
                                skipped_props += 1
                                continue
                        except Exception as l5_e:
                            print(f"❌ L5 fetch failed: {str(l5_e)}")
                            l5_fetch_failures += 1
                            stats_fetch_failed += 1
                            skipped_props += 1
                            continue
                    else:
                        print(f"📋 Using cached L5 data for {current_player}")
                        L5arr = cached_l5_data
                        if not L5arr:
                            print(f"❌ SKIP: Cached L5 data is empty for {current_player}")
                            l5_fetch_failures += 1
                            stats_fetch_failed += 1
                            skipped_props += 1
                            continue
                    
                    # Fetch H2H specific stat data (only when stat type changes)
                    if len(h2harr) > 0:
                        if i == 0 or prop.stat_type != previous_stat:
                            print(f"🎯 Extracting H2H {prop.stat_type} data from {len(h2harr)} games")
                            try:
                                h2hstatarr = self.fetch_stats_instant(
                                    lambda: dataFinder.nfl_stat(current_player, prop.stat_type, against_team, getattr(prop, 'position', 'Unknown'), h2harr),
                                    f"NFL specific stat {prop.stat_type} for {current_player}"
                                )
                                if h2hstatarr:
                                    print(f"✅ H2H stat data extracted: {len(h2hstatarr)} values - {h2hstatarr}")
                                    # Cache the H2H stat data for the current stat type
                                    cached_h2h_stat_data = h2hstatarr
                                else:
                                    print(f"⚠️ H2H stat extraction returned empty array")
                                    cached_h2h_stat_data = []
                                    h2hstatarr = []
                            except Exception as stat_e:
                                print(f"❌ H2H stat extraction error: {str(stat_e)}")
                                h2hstat_fetch_failures += 1
                                cached_h2h_stat_data = []
                                h2hstatarr = []
                        else:
                            print(f"📋 Using cached H2H stat data for {prop.stat_type}")
                            h2hstatarr = cached_h2h_stat_data or []
                    else:
                        print(f"📝 No H2H data available - will use L5 only")
                        h2hstatarr = []
                    
                    # Fetch L5 specific stat data (only when stat type changes)
                    if i == 0 or prop.stat_type != previous_stat:
                        print(f"🎯 Extracting L5 {prop.stat_type} data from {len(L5arr)} games")
                        try:
                            L5statarr = self.fetch_stats_instant(
                                lambda: dataFinder.nfl_stat_L5(current_player, prop.stat_type, against_team, getattr(prop, 'position', 'Unknown'), L5arr),
                                f"NFL L5 specific stat {prop.stat_type} for {current_player}"
                            )
                            if L5statarr:
                                print(f"✅ L5 stat data extracted: {len(L5statarr)} values - {L5statarr}")
                                # Cache the L5 stat data for the current stat type
                                cached_l5_stat_data = L5statarr
                            else:
                                print(f"❌ SKIP: L5 stat extraction returned empty for {current_player} - {prop.stat_type}")
                                l5stat_fetch_failures += 1
                                skipped_props += 1
                                continue
                        except Exception as stat_e:
                            print(f"❌ L5 stat extraction error: {str(stat_e)}")
                            l5stat_fetch_failures += 1
                            skipped_props += 1
                            continue
                    else:
                        print(f"📋 Using cached L5 stat data for {prop.stat_type}")
                        L5statarr = cached_l5_stat_data
                        if not L5statarr:
                            print(f"❌ SKIP: Cached L5 stat data is empty for {prop.stat_type}")
                            l5stat_fetch_failures += 1
                            skipped_props += 1
                            continue
                    
                    request_time = time.time() - request_start_time
                    print(f"⏱️ Data fetch completed in {request_time:.2f}s")
                    
                except Exception as e:
                    print(f"❌ CRITICAL: Stats fetch failed for {current_player} - {prop.stat_type}: {str(e)}")
                    failed_requests += 1
                    skipped_props += 1
                    continue
                
                size = len(h2hstatarr)
                l5_size = len(L5statarr)
                
                if size == 0:
                    print(f"⚠️ H2H stats array is empty for {current_player} - will use L5 data only")
                    
                if l5_size == 0:
                    print(f"❌ SKIP: L5 stats array is empty for {current_player}")
                    data_availability_issues += 1
                    skipped_props += 1
                    continue

                print(f"📊 Sample sizes: H2H={size} games, L5={l5_size} games")

                # Add performance data to prop with enhanced error handling
                try:
                    # CRITICAL: Final validation that L5 data exists before scoring
                    if not L5statarr or len(L5statarr) == 0:
                        print(f"❌ SKIP: L5 data validation failed for {current_player}")
                        data_availability_issues += 1
                        skipped_props += 1
                        continue
                    
                    # Validate data before adding
                    if h2hstatarr and len(h2hstatarr) > 0:
                        print(f"📝 Adding H2H performance data: {h2hstatarr}")
                        prop.add_performance_data(h2hstatarr, "H2H1Y")
                    else:
                        print(f"📝 No H2H data to add")
                    
                    if L5statarr and len(L5statarr) > 0:
                        print(f"📝 Adding L5 performance data: {L5statarr}")
                        prop.add_performance_data(L5statarr, "L5")
                    else:
                        print(f"❌ CRITICAL: L5 data validation failed during add")
                        performance_data_errors += 1
                        skipped_props += 1
                        continue
                    
                except Exception as e:
                    print(f"❌ Error adding performance data: {str(e)}")
                    performance_data_errors += 1
                    skipped_props += 1
                    continue

                # Enhanced NFL Scoring System with detailed logging
                size = len(h2hstatarr) if h2hstatarr else 0
                
                if size > 0:
                    temp = sum(1 for val in h2hstatarr if val >= prop.line_score)
                    avg = round(sum(h2hstatarr) / size, 3)
                    diff = round(avg - prop.line_score, 3)
                    rel_diff = round((avg - prop.line_score) / (prop.line_score + 5), 3)
                    percent = round(100 * diff / prop.line_score, 3)

                    # Calculate ongoing streak
                    ongoing = 0
                    for val in reversed(h2hstatarr):
                        if val >= prop.line_score:
                            ongoing += 1
                        else:
                            break
                            
                    print(f"🎯 H2H Analysis: {temp}/{size} hits ({temp/size:.3f}), avg: {avg}, streak: {ongoing}")
                else:
                    # No H2H data available - use L5 data for scoring
                    temp = 0
                    avg = 0
                    diff = 0
                    rel_diff = 0
                    percent = 0
                    ongoing = 0
                    print(f"📊 H2H Analysis: No data - using L5 only")

                # Calculate L5 performance metrics with detailed logging
                l5_size = len(L5statarr) if L5statarr else 0
                l5_hit_rate = 0
                l5_avg = 0
                l5_consistency = 0

                if l5_size > 0:
                    try:
                        l5_hits = sum(1 for val in L5statarr if val >= prop.line_score)
                        l5_hit_rate = l5_hits / l5_size
                        l5_avg = sum(L5statarr) / l5_size
                        l5_consistency = 1 - (max(L5statarr) - min(L5statarr)) / (max(L5statarr) + 1) if max(L5statarr) > 0 else 0
                        print(f"🎯 L5 Analysis: {l5_hits}/{l5_size} hits ({l5_hit_rate:.3f}), avg: {l5_avg:.2f}, consistency: {l5_consistency:.3f}")
                    except Exception as e:
                        print(f"❌ L5 calculation error: {str(e)}")
                        l5_size = 0
                        l5_hit_rate = 0
                        l5_avg = 0
                        l5_consistency = 0

                # Enhanced scoring components with logging
                if size > 0:
                    hit_rate_score = (temp / size) * 0.25                    # Base hit rate (25%)
                    streak_score = (ongoing / size) * 0.20                   # Current streak (20%)
                    margin_score = min(rel_diff * 2, 0.10)                   # Margin of victory (10%)
                    sample_size_bonus = min(size / 20, 0.10)                 # Sample size bonus (10%)
                    print(f"📈 H2H Scoring: hit_rate={hit_rate_score:.3f}, streak={streak_score:.3f}, margin={margin_score:.3f}, size_bonus={sample_size_bonus:.3f}")
                else:
                    # No H2H data - adjust scoring weights to focus on L5 data
                    hit_rate_score = 0                                      # No H2H hit rate available
                    streak_score = 0                                        # No H2H streak available
                    margin_score = 0                                        # No H2H margin available
                    sample_size_bonus = 0                                   # No H2H sample size available
                    print(f"📈 H2H Scoring: No H2H data available - all components = 0")
                
                recent_form_score = l5_hit_rate * 0.20                   # Recent form (20%)
                consistency_score = l5_consistency * 0.15                 # Consistency (15%)
                print(f"📈 L5 Scoring: recent_form={recent_form_score:.3f}, consistency={consistency_score:.3f}")

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
                    print(f"📊 Base score (with H2H): {base_score:.3f}")
                else:
                    # L5-only scoring - adjust weights to compensate for missing H2H data
                    base_score = (
                        recent_form_score * 1.5 +      # Increase L5 weight from 20% to 30%
                        consistency_score * 1.5        # Increase consistency weight from 15% to 22.5%
                    )
                    print(f"📊 Base score (L5 only): {base_score:.3f}")

                # Odds type adjustment (risk-based scoring)
                odds_multiplier = 1.0
                if current_odds == "goblin":
                    odds_multiplier = 1.15  # Higher risk, higher potential reward
                elif current_odds == "demon":
                    odds_multiplier = 0.90  # Lower risk, lower potential reward
                print(f"🎲 Odds multiplier ({current_odds}): {odds_multiplier}")

                # Position-based adjustments
                position_multiplier = 1.0
                prop_position = getattr(prop, 'position', 'Unknown')
                if prop_position == "QB":
                    position_multiplier = 1.05  # QBs are more predictable
                elif prop_position == "RB":
                    position_multiplier = 1.02  # RBs are moderately predictable
                elif prop_position == "WR":
                    position_multiplier = 0.98  # WRs are less predictable
                elif prop_position == "TE":
                    position_multiplier = 0.95  # TEs are least predictable
                print(f"🏈 Position multiplier ({prop_position}): {position_multiplier}")

                # Final enhanced score
                enhanced_score = round(base_score * odds_multiplier * position_multiplier, 3)
                print(f"🏆 Final enhanced score: {enhanced_score}")

                # Set the enhanced score with error handling
                try:
                    prop.score = enhanced_score
                except Exception as e:
                    print(f"❌ Error setting prop score: {str(e)}")
                    skipped_props += 1
                    continue

                # ESSENTIAL DEBUG: Print prop analysis results
                print(f"📊 FINAL: {current_player} ({prop.stat_type} {prop.line_score}): H2H={h2hstatarr}, L5={L5statarr}, vs={against_team}, score={enhanced_score}")

                # Enhanced row data for better debugging
                row = [
                    current_player, team_name, against_team, prop.stat_type, prop.line_score, current_odds, str(h2hstatarr),
                    temp, size, avg, diff, rel_diff, percent, enhanced_score, game_id
                ]
                col_widths = [max(col_widths[j], len(str(row[j])) + 2) for j in range(len(headers))]

                if current_odds == "standard":
                    data_rows.append(row)
                elif current_odds == "demon":
                    data_rows_demon.append(row)
                elif current_odds == "goblin":
                    data_rows_goblin.append(row)

                # Update tracking variables
                previous_player = current_player
                previous_stat = prop.stat_type
                
                # Increment processed count
                processed_props += 1
                print(f"✅ Successfully processed prop {processed_props}")
                print("-" * 80)

            except Exception as e:
                print(f"❌ CRITICAL ERROR processing NFL prop {i+1}:")
                print(f"   Player: {current_player}")
                print(f"   Stat: {prop.stat_type}")
                print(f"   Line: {prop.line_score}")
                print(f"   Team: {team_name}")
                print(f"   Position: {getattr(prop, 'position', 'Unknown')}")
                print(f"   Against: {against_team}")
                print(f"   Error: {str(e)}")
                print(f"   Traceback: {traceback.format_exc()}")
                failed_requests += 1
                skipped_props += 1
                print("-" * 80)
                continue

        # Enhanced processing summary with detailed breakdown
        total_props = len(props)
        print(f"\n📊 === NFL PROCESSING SUMMARY ===")
        print(f"Total Props: {total_props}")
        print(f"Successfully Processed: {processed_props}")
        print(f"Skipped Props: {skipped_props}")
        print(f"Success Rate: {(processed_props/total_props)*100:.1f}%")
        print(f"\n🔍 === FAILURE BREAKDOWN ===")
        print(f"Player Name Errors: {player_name_errors}")
        print(f"H2H Fetch Failures: {h2h_fetch_failures}")
        print(f"L5 Fetch Failures: {l5_fetch_failures}")
        print(f"H2H Stat Extraction Failures: {h2hstat_fetch_failures}")
        print(f"L5 Stat Extraction Failures: {l5stat_fetch_failures}")
        print(f"Team Mapping Failures: {team_mapping_failures}")
        print(f"Data Availability Issues: {data_availability_issues}")
        print(f"Performance Data Errors: {performance_data_errors}")
        print(f"Total Failed Requests: {failed_requests}")
        print(f"\n⚡ === PERFORMANCE ===")
        print(f"Stats Fetch Success: {stats_fetch_success}")
        print(f"Stats Fetch Failed: {stats_fetch_failed}")
        print(f"Total API Requests: {request_count}")
        processing_time = time.time() - self._processing_start_time
        print(f"Total Processing Time: {processing_time:.2f}s")
        print(f"Average Time Per Prop: {processing_time/total_props:.2f}s")
        print("=" * 40)

    
    def start_scheduler(self):
        """Start the background scheduler"""
        print("🚀 Starting enhanced props processor...")
        
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
        
        print("📅 Scheduler started - processing every 60 minutes")
        
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
            # Make the stats request
            start_time = time.time()
            result = stats_function()
            request_time = time.time() - start_time
            
            return result
                        
        except Exception as e:
            return None
    

    
    def test_filtering_with_sample_data(self, league_id):
        """Test the filtering system with sample data"""
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
        
        # Test filtering
        filtered_props = self.filter_new_props(sample_props, league_id)
        
        print(f"🧪 Test: {len(filtered_props)}/{len(sample_props)} props would be processed")
        return filtered_props

    def test_dataframe_columns(self):
        """Test function to debug dataframe column issues"""
        try:
            # Load the actual CSV file
            df = pd.read_csv('Testing.csv')
            print(f"📊 CSV: {len(df)} rows, {len(df.columns)} columns")
            
            # Test NBA filtering
            nba_data = PPnbapicks.filter_rows_by_league_id(df, 7)
            print(f"🏀 NBA: {len(nba_data)} rows")
            
            # Test NFL filtering
            nfl_data = PPnbapicks.filter_rows_by_league_id(df, 9)
            print(f"🏈 NFL: {len(nfl_data)} rows")
            
            return df
            
        except Exception as e:
            print(f"❌ Error testing dataframe: {e}")
            return None

    def test_game_mapping(self):
        """Test the game mapping functionality with sample data"""
        # Create sample norm data for testing
        import pandas as pd
        
        sample_data = {
            'Game ID': ['game1', 'game1', 'game2', 'game2', 'game3'],
            'Team Name': ['Lakers', 'Warriors', 'Celtics', 'Heat', 'Knicks'],
            'Display Name': ['LeBron James', 'Stephen Curry', 'Jayson Tatum', 'Jimmy Butler', 'Julius Randle'],
            'Stat Type': ['Points', 'Points', 'Points', 'Points', 'Points'],
            'Line Score': [25.5, 28.5, 24.5, 22.5, 20.5],
            'Odds Type': ['standard', 'standard', 'standard', 'standard', 'standard']
        }
        
        test_norm = pd.DataFrame(sample_data)
        
        # Test NBA game mapping logic
        game_team_map = test_norm.groupby("Game ID")["Team Name"].unique().to_dict()
        against_team_map = {}

        for game_id, teams in game_team_map.items():
            teams_list = list(teams)
            
            if len(teams_list) == 2:
                team1, team2 = teams_list[0], teams_list[1]
                against_team_map[game_id] = {team1: team2, team2: team1}
            elif len(teams_list) == 1:
                team_name = teams_list[0]
                against_team_map[game_id] = {team_name: "Unknown_Opponent"}
        
        print(f"🧪 Game mapping test: {len(against_team_map)} games mapped")
        
        return against_team_map

if __name__ == "__main__":
    processor = EnhancedPropsProcessor()
    
    # Uncomment one of the lines below to test specific functionality instead of starting scheduler
    # processor.test_filtering_with_sample_data(7)  # Test with NBA
    # processor.test_game_mapping()  # Test game mapping logic
    # processor.test_dataframe_columns()  # Test dataframe column structure
    
    processor.start_scheduler()
