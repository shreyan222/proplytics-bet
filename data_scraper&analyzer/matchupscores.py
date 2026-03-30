import requests
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
import scipy.stats as stats
import pprint
 

def compute_matchup_scores(def_stat_dict):
    teams = list(def_stat_dict.keys())
    values = np.array(list(def_stat_dict.values()))

    # Compute Z-scores
    mean_val = np.mean(values)
    std_val = np.std(values)
    z_scores = (values - mean_val) / std_val

    # Convert Z-scores to percentile (0-100)
    percentiles = stats.rankdata(z_scores) / len(z_scores) * 100

    return {team: round(score, 2) for team, score in zip(teams, percentiles)}


def swap_team_rows_batch(filtered_matchup_data, team, start_row1, start_row2):
    """
    Swaps 4 consecutive rows within a given team in filtered_matchup_data.

    Parameters:
    - filtered_matchup_data: List of tuples (team, matchup_data)
    - team: The team whose rows need to be swapped (str)
    - start_row1: Starting index (0-based) of the first set of 4 rows to swap within the team's data
    - start_row2: Starting index (0-based) of the second set of 4 rows to swap within the team's data

    Returns:
    - None (modifies filtered_matchup_data in place)
    """

    # Find all indices where the team appears in the dataset
    team_indices = [i for i, (t, _) in enumerate(filtered_matchup_data) if t == team]

    # Ensure both start_row1 and start_row2 allow for swapping 4 rows
    if len(team_indices) >= 20 and 0 <= start_row1 <= 16 and 0 <= start_row2 <= 16:
        for i in range(4):  # Swap 4 rows in sequence
            idx1, idx2 = team_indices[start_row1 + i], team_indices[start_row2 + i]
            filtered_matchup_data[idx1], filtered_matchup_data[idx2] = (
                filtered_matchup_data[idx2],
                filtered_matchup_data[idx1],
            )
    else:
        print(f"Invalid swap request for team {team}: row indices out of range.")


# Example Usage:


# Scrape the data
url = "https://www.fantasypros.com/daily-fantasy/nba/fanduel-defense-vs-position.php"
response = requests.get(url)
response.raise_for_status()
soup = BeautifulSoup(response.text, 'html.parser')

# Extract headers and matchup data
time_period = soup.find('h1').find_next('p').text.strip()
table = soup.find('table', {'id': 'data-table'})
headers = [header.text.strip() for header in table.find_all('th')]
matchup_data = []

for row in table.find_all('tr')[1:]:
    row_classes = row.get("class")
    columns = row.find_all('td')
    team = columns[0].text.strip()[:3]  # First column is team abbreviation
    matchups = [float(col.text.strip()) for col in columns[1:]]  # Convert values to float
    matchup_data.append((team, matchups, row_classes))

# Create dictionary to group data by team
team_matchup_dict = {}
for team, matchups, row_classes in matchup_data:
    if team not in team_matchup_dict:
        team_matchup_dict[team] = []
    # store both matchups and row_classes so we can print class info later
    team_matchup_dict[team].append((matchups, row_classes))

# Remove the last 4 entries for each team
for team in team_matchup_dict:
    team_matchup_dict[team] = team_matchup_dict[team][4:-4]  # Exclude last 4 matchups

pprint.pprint(matchup_data)
print(len(matchup_data))
pprint.pprint(team_matchup_dict)
print(len(team_matchup_dict))

filtered_matchup_data = []
filtered_row_classes = []
for team, matchups_list in team_matchup_dict.items():
    for matchups, row_classes in matchups_list:
        filtered_matchup_data.append((team, [team] + matchups))
        filtered_row_classes.append(row_classes)

# Remove the first row from every 4-row group in the underlying arrays
filtered_matchup_data = [
    row for i, row in enumerate(filtered_matchup_data) if (i + 1) % 4 != 1
]
filtered_row_classes = [
    rc for i, rc in enumerate(filtered_row_classes) if (i + 1) % 4 != 1
]

# Build 15 arrays (PG/SG/SF/PF/C × GC-7/GC-15/GC-30) using row_class metadata
# Add composite stats: PTS+REB, PTS+AST, REB+AST, PTS+REB+AST, BLK+STL
headers = [
    'Team', 'GP', 'PTS', 'REB', 'AST', '3PM', 'STL', 'BLK', 'TO', 'FD PTS',
    'PTS+REB', 'PTS+AST', 'REB+AST', 'PTS+REB+AST', 'BLK+STL'
]
positions = {"PG", "SG", "SF", "PF", "C"}
timeframes = {"GC-7", "GC-15", "GC-30"}
pos_time_to_rows = {(pos, tf): [] for pos in positions for tf in timeframes}

for (team, stats_values), row_class in zip(filtered_matchup_data, filtered_row_classes):
    if not row_class or len(row_class) < 2:
        continue
    timeframe, position = row_class[0], row_class[1]
    if timeframe in timeframes and position in positions:
        vals = stats_values[:]  # [Team, GP, PTS, REB, AST, 3PM, STL, BLK, TO, FD PTS]
        pts, reb, ast = vals[2], vals[3], vals[4]
        stl, blk = vals[6], vals[7]
        vals.extend([
            pts + reb,          # PTS+REB
            pts + ast,          # PTS+AST
            reb + ast,          # REB+AST
            pts + reb + ast,    # PTS+REB+AST
            blk + stl,          # BLK+STL
        ])
        pos_time_to_rows[(position, timeframe)].append(vals)

# Convert to pandas DataFrames with numeric-only columns (Team column omitted per request)
arrays_by_pos_time = {
    f"{pos}_{tf}": pd.DataFrame(rows, columns=headers)
    for (pos, tf), rows in pos_time_to_rows.items()
}

# Store defense values in a 4D dict: def_val[pos][timeframe][stat][team] = number
pos_order = ["PG", "SG", "SF", "PF", "C"]
tf_order = ["GC-7", "GC-15", "GC-30"]
tf_alias = {"GC-7": "l7", "GC-15": "l15", "GC-30": "l30"}
stat_cols = headers[1:]

def_val = {
    pos.lower(): {
        tf_alias[tf]: {stat: {} for stat in stat_cols}
        for tf in tf_order
    }
    for pos in pos_order
}

for pos in pos_order:
    for tf in tf_order:
        rows = pos_time_to_rows[(pos, tf)]
        for r in rows:
            team = r[0]
            stat_values = r[1:]
            for stat_name, stat_val in zip(stat_cols, stat_values):
                def_val[pos.lower()][tf_alias[tf]][stat_name][team] = float(stat_val)

# Precompute rank tables once: def_rank[pos][timeframe][stat][team] = rank (30 easiest ... 1 hardest)
def_rank = {
    pos: {
        tf_alias[tf]: {stat: {} for stat in stat_cols}
        for tf in tf_order
    }
    for pos in [p.lower() for p in pos_order]
}

for pos in [p.lower() for p in pos_order]:
    for tf in tf_alias.values():
        for stat in stat_cols:
            stat_map = def_val[pos][tf].get(stat, {})
            if not stat_map:
                continue
            # Higher value => easier (rank 30). Lower value => harder (rank 1).
            ordered = sorted(stat_map.items(), key=lambda kv: kv[1], reverse=True)
            for idx, (team, _) in enumerate(ordered):
                def_rank[pos][tf][stat][team] = len(ordered) - idx

# Print a quick sample of the structure; comment out if noisy
for pos in ["pg"]:
    for tf in ["l7"]:
        sample_stat = "PTS"
        sample = def_val[pos][tf].get(sample_stat, {})
        print(f"{pos}/{tf}/{sample_stat} teams: {list(sample.keys())[:5]}")
print(def_val["pg"]["l7"]["PTS"])
#print(def_rank)