
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

class EnhancedPropsProcessor:
    def __init__(self):
        self.uploader = SupabaseUploader()
        self.is_running = False
        
    def load_props_from_file(self, filename='nba_props.pkl'):
        """Load props from pickle file"""
        try:
            with open(filename, 'rb') as f:
                props = pickle.load(f)
                return props
        except FileNotFoundError:
            print(f"{filename} not found.")
            return []
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

                time.sleep(1)

            except Exception as e:
                print(f"Error fetching depth chart for {team}: {e}")
                team_depth_charts[team] = {}

        return position_cache

    def run_processing_cycle(self):
        """Run a complete processing cycle"""
        if self.is_running:
            print("Processing cycle already running, skipping...")
            return
            
        self.is_running = True
        start_time = time.time()
        
        try:
            print(f"\n{'='*50}")
            print(f"Starting processing cycle at {datetime.now()}")
            print(f"{'='*50}")
            
            # Load your existing data
            df = pd.read_csv('Testing.csv')
            output_file = "output_data.csv"
            props = self.load_props_from_file()
            
            # Run your existing processing logic
            norm1 = PPnbapicks.RemoveSearch(PPnbapicks.filter_rows_by_league_id(df, 7), "Combo")
            norm2 = PPnbapicks.RemoveSearch(norm1, "Dunks")
            norm = PPnbapicks.RemoveSearch(norm2, "Fantasy Score")
            norm['Display Name'] = norm['Display Name'].apply(unidecode)
            name = PPnbapicks.Lists(norm, "Name")
            line = PPnbapicks.Lists(norm, "lineScore")
            stat = PPnbapicks.Lists(norm, "StatType")
            odds = PPnbapicks.Lists(norm, "OddType")
            team = PPnbapicks.Lists(norm, "TeamName")
            gameid = PPnbapicks.Lists(norm, "GameID")

            pd.set_option('display.max_rows', None)
            pd.set_option('display.max_columns', None)
            pd.set_option('display.width', None)
            pd.set_option('display.max_colwidth', None)
            

            # Process the data with your existing algorithms
            self.combinetoverPropraternum2(0, "since-2023-2024-season", props, norm)
            self.combinetoverPropraternum2(0, "since-2024-2025-season", props, norm)
            
            # Save updated props
            with open('nba_props.pkl', 'wb') as f:
                pickle.dump(props, f)
            
            # Upload to Supabase
            if props:
                print(f"\nUploading {len(props)} props to Supabase...")
                success = self.uploader.upload_with_retry(props, metadata={
                    'processing_time_seconds': time.time() - start_time,
                    'total_props': len(props),
                    'timestamp': datetime.now().isoformat()
                })
                
                if success:
                    print("✅ Successfully uploaded to Supabase!")
                else:
                    print("❌ Failed to upload to Supabase")
            else:
                print("No props to upload")
                
            end_time = time.time()
            elapsed_time = end_time - start_time
            print(f"\n🎉 Processing cycle completed in {elapsed_time:.2f} seconds")
            
        except Exception as e:
            print(f"❌ Error in processing cycle: {e}")
            print(traceback.format_exc())
        finally:
            self.is_running = False
    
    
    def combinetoverPropraternum2(self, num, timeframe, props, norm):
        output_file = "output_data.csv"
        name = PPnbapicks.Lists(norm, "Name")
        line = PPnbapicks.Lists(norm, "lineScore")
        stat = PPnbapicks.Lists(norm, "StatType")
        odds = PPnbapicks.Lists(norm, "OddType")
        team = PPnbapicks.Lists(norm, "TeamName")
        gameid = PPnbapicks.Lists(norm, "GameID")

        global h2harr, current_player, current_prop, L5arr, h2hstatarr
        print(timeframe)
        unique_teams = norm["Team Name"].nunique()
        print(f"Number of different teams: {unique_teams}")
        prop_counts = norm["Odds Type"].value_counts().to_dict()
        num_goblin = prop_counts.get("goblin", 0)
        num_demon = prop_counts.get("demon", 0)
        num_standard = prop_counts.get("standard", 0)

        print(f"Goblin props: {num_goblin}")
        print(f"Demon props: {num_demon}")
        print(f"Standard props: {num_standard}")
        game_team_map = norm.groupby("Game ID")["Team Name"].unique().to_dict()
        print(game_team_map)
        against_team_map = {}

        for game_id, teams in game_team_map.items():
            if len(teams) == 2:
                team1, team2 = teams
                against_team_map[game_id] = {team1: team2, team2: team1}
            else:
                team_name = teams[0]
                against_team_map[game_id] = {team_name: dataFinder.against_team(team_name)}

        print("Fixed against_team_map sample:")
        for game_id, teams in list(against_team_map.items())[:10]:
            print(f"Game ID: {game_id} -> {teams}")
        unique_teams = norm["Team Name"].unique()
        print(f"Fetching depth charts for {len(unique_teams)} teams...")

        position_cache = self.fetch_all_team_positions(unique_teams)
        print(position_cache)
        player_positions = []
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
        for i in range(num, len(norm)):
            try:
                current_player = name[i]
                current_prop = f"{stat[i]} over {line[i]}"

                team_name = norm.iloc[i]["Team Name"]
                against_team = against_team_map.get(gameid[i], {}).get(team_name, "Unknown")
                props[i].against_team = against_team
                if 'StartTime' in norm.columns:
                    raw_time = norm.iloc[i]['StartTime']
                    if pd.isna(raw_time) or raw_time in ['', 'NaT', None]:
                        props[i].start_time = None
                    else:
                        try:
                            # Convert to ISO 8601
                            parsed_time = pd.to_datetime(raw_time)
                            props[i].start_time = parsed_time.isoformat()
                        except:
                            print(f"⚠️ Invalid start_time for row {i}: {raw_time}")
                            props[i].start_time = None
                else:
                    props[i].start_time = "2025-06-18T22:00:00Z"

                position = position_cache.get(current_player, "Unknown")
                player_positions.append(position)

                if i == 0 or name[i] != name[i - 1]:
                    h2harr = dataFinder.stats_against_team_t_season(name[i], against_team, timeframe)
                if i == 0 or stat[i] != stat[i - 1]:
                    h2hstatarr = dataFinder.specific_stat_vs_opp_games_arr(h2harr, stat[i])

                h2hsize = len(h2hstatarr)
                if timeframe == "since-2024-2025-season":
                    props[i].add_performance_data(h2hstatarr, "H2H1Y")
                elif timeframe == "since-2023-2024-season":
                    props[i].add_performance_data(h2hstatarr, "H2H2Y")

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
                    props[i].add_performance_data(L5statarr, "L5")
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
                        player_positions[i],
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
                        print(f"Error: row has {len(row)} items, but col_widths has {len(col_widths)} items. Row: {row}")
                    else:
                        formatted_row = "".join(f"{str(item):<{col_widths[i]}}" for i, item in enumerate(row))
                        print(formatted_row)

                    time.sleep(0.1)




            except Exception as e:


                error_message = (
                    f"Error processing:\n"
                    f"  Player: {current_player}\n"
                    f"  Prop: {current_prop}\n"
                    f"  Details: {str(e)}\n"
                    f"  Traceback: {traceback.format_exc()}"
                )

                print(error_message)
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

    
    def start_scheduler(self):
        """Start the background scheduler"""
        print("🚀 Starting enhanced props processor with scheduler...")
        
        # Schedule the processing cycle every 7 minutes
        schedule.every(7).minutes.do(self.run_processing_cycle)
        
        # Run initial cycle
        self.run_processing_cycle()
        
        # Start scheduler in background thread
        def run_scheduler():
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        
        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()
        
        print("📅 Scheduler started - will process every 7 minutes")
        
        try:
            # Keep the main thread alive
            while True:
                time.sleep(10)
        except KeyboardInterrupt:
            print("\n🛑 Shutting down enhanced props processor...")

if __name__ == "__main__":
    processor = EnhancedPropsProcessor()
    processor.start_scheduler()
