from bs4 import BeautifulSoup
import requests

def get_nfl_team_name(team_abbr):
    """
    Centralized function to convert NFL team abbreviations to full team names.
    This ensures consistency across all functions and makes maintenance easier.
    """
    team_mapping = {
        "ARI": "Arizona",
        "ATL": "Atlanta", 
        "BAL": "Baltimore",
        "BUF": "Buffalo",
        "CAR": "Carolina",
        "CHI": "Chicago",
        "CIN": "Cincinnati",
        "CLE": "Cleveland",
        "DAL": "Dallas",
        "DEN": "Denver",
        "DET": "Detroit",
        "GB": "Green Bay",
        "HOU": "Houston",
        "IND": "Indianapolis",
        "JAC": "Jacksonville",
        "JAX": "Jacksonville",  # Alternative abbreviation
        "KC": "Kansas City",
        "LA": "Los Angeles",
        "LAC": "Los Angeles Chargers",
        "LAR": "Los Angeles Rams",
        "LV": "Raiders",
        "MIA": "Miami",
        "MIN": "Minnesota",
        "NE": "New England",
        "NO": "New Orleans",
        "NYG": "New York Giants",
        "NYJ": "New York Jets",
        "PHI": "Philadelphia",
        "PIT": "Pittsburgh",
        "SEA": "Seattle",
        "SF": "49ers",
        "TB": "Buccaneers",
        "TEN": "Tennessee",
        "WAS": "Washington",
        "WSH": "Commanders"
    }
    
    return team_mapping.get(team_abbr, team_abbr)  # Return original if not found

def truncate_list_after_two_empty_elements(lst):

    for i in range(len(lst) - 1):
        if lst[i] == "" and lst[i + 1] == "":
            return lst[:i]  # Return the sublist excluding the two empty elements
    return lst
def against_team_nfl(team):
    # Use centralized team mapping function and convert to lowercase for this specific use case
    team = get_nfl_team_name(team).lower()

    # Get the HTML content
    html_text = requests.get(f'https://www.statmuse.com/nfl/ask/what-team-are-the-{team}-playing-next').text
    soup = BeautifulSoup(html_text, 'lxml')

    # Find the relevant span with the opponent information
    opp = soup.find('span',
                    class_='my-[1em] [&>a]:underline [&>a]:text-team-secondary whitespace-pre-wrap text-pretty').text

    # Determine the start index based on '@ ' or 'vs '
    start_index = opp.find('@ ')
    if start_index != -1:
        start_index += 2  # Move index to after '@ '
    else:
        start_index = opp.find('vs ')
        if start_index != -1:
            start_index += 3  # Move index to after 'vs '

    # Find the position of the next space after '@ ' or 'vs '
    if start_index != -1:
        end_index = opp.find(' ', start_index)
        if end_index == -1:  # If no space found, use the rest of the string
            end_index = len(opp)

        # Extract and print the substring
        substring = opp[start_index:end_index].strip()

        # Check and return the opponent's name
        if substring.upper() != "MIN":
            return substring
        else:
            return "minnesota"

    return None  # In case neither '@ ' nor 'vs ' is found
def nflprop(name, team):
    # Use centralized team mapping function
    team = get_nfl_team_name(team)
    if(name=="D.J. Moore"):
        name = "DJ Moore"
    html_text = requests.get(f'https://www.statmuse.com/nfl/ask/{name}-against-{team}-including-playoffs').text
    soup = BeautifulSoup(html_text, 'lxml')
    table = soup.find('table', class_='whitespace-nowrap w-full')

    stats = []
    if not table:
        return stats
    else:
        for row in table.find_all("tr"):
            cells = row.findAll("td")
            if cells == []:
                cells = row.find_all("th")
            for i in cells:
                stat = i.text
                stats.append(stat)
        final =  truncate_list_after_two_empty_elements(stats)

        words_to_remove = ["afc", "nfc", "super","round"]

        filtered_items = [item for item in final if not any(word in item.lower() for word in words_to_remove)]

        return (filtered_items)
def nflprop_l5(name):
    if name == "D.J. Moore":
        name = "DJ Moore"
    html_text = requests.get(f'https://www.statmuse.com/nfl/ask/{name}-last-5-games').text
    soup = BeautifulSoup(html_text, 'lxml')
    table = soup.find('table', class_='whitespace-nowrap w-full')

    stats = []
    if not table:
        return stats
    else:
        for row in table.find_all("tr"):
            cells = row.findAll("td")
            if cells == []:
                cells = row.find_all("th")
            for i in cells:
                stat = i.text
                stats.append(stat)
        final =  truncate_list_after_two_empty_elements(stats)

        words_to_remove = ["afc", "nfc", "super","round"]

        filtered_items = [item for item in final if not any(word in item.lower() for word in words_to_remove)]

        return (filtered_items)
def nflprop_qbrush(name, team):
    # Use centralized team mapping function
    team = get_nfl_team_name(team)
    html_text = requests.get(f'https://www.statmuse.com/nfl/ask/{name}-rushing-stats-against-{team}-including-playoffs').text
    soup = BeautifulSoup(html_text, 'lxml')
    table = soup.find('table', class_='whitespace-nowrap w-full')

    stats = []
    if not table:
        return stats
    else:
        for row in table.find_all("tr"):
            cells = row.findAll("td")
            if cells == []:
                cells = row.find_all("th")
            for i in cells:
                stat = i.text
                stats.append(stat)
        final = truncate_list_after_two_empty_elements(stats)

        words_to_remove = ["afc", "nfc", "super", "round"]

        filtered_items = [item for item in final if not any(word in item.lower() for word in words_to_remove)]

        return (filtered_items)
def nflprop_qbrush_l5(name):
    html_text = requests.get(f'https://www.statmuse.com/nfl/ask/{name}-rushing-stats-last-5-games').text
    soup = BeautifulSoup(html_text, 'lxml')
    table = soup.find('table', class_='whitespace-nowrap w-full')

    stats = []
    if not table:
        return stats
    else:
        for row in table.find_all("tr"):
            cells = row.findAll("td")
            if cells == []:
                cells = row.find_all("th")
            for i in cells:
                stat = i.text
                stats.append(stat)
        final = truncate_list_after_two_empty_elements(stats)

        words_to_remove = ["afc", "nfc", "super", "round"]

        filtered_items = [item for item in final if not any(word in item.lower() for word in words_to_remove)]

        return (filtered_items)
def old_nfl_stat(name, stat, team, pos):
    # Use centralized team mapping function
    team = get_nfl_team_name(team)
    arr = nflprop(name, team)


    arr1 = []
    arr3 = []
    'return list above'

    stat1 = []
    stat4 = []
    stat7 = []
    if stat == "Pass Yards":
        for i in range(21, len(arr)):
            if (i - 10) % 19 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Pass Completions":
        for i in range(21, len(arr)):
            if (i - 7) % 19 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Completion Percentage":
        for i in range(21, len(arr)):
            if (i - 9) % 19 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [float(x) for x in arr2]
    elif stat == "Pass Attempts":
        for i in range(21, len(arr)):
            if (i - 8) % 19 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "INT":
        for i in range(21, len(arr)):
            if (i - 13) % 19 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Receiving Yards" and (pos == "WR" or pos == "TE"):
        for i in range(17, len(arr)):
            if (i - 9) % 16 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Rec Targets" and (pos == "WR" or pos == "TE"):
        for i in range(17, len(arr)):
            if (i - 8) % 16 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Receptions" and (pos == "WR" or pos == "TE"):
        for i in range(17, len(arr)):
            if (i - 7) % 16 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Receptions" and (pos == "RB"):
        for i in range(17, len(arr)):
            if (i - 12) % 16 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Rec Targets" and (pos == "RB"):
        for i in range(17, len(arr)):
            if (i - 13) % 16 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Rush+Rec TDs" and (pos == "WR" or pos == "TE"):
        for i in range(17, len(arr)):
            if (i - 11) % 16 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Rush Yards" and pos == "RB":
        for i in range(17, len(arr)):
            if (i - 7) % 16 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Rush Attempts" and pos == "RB":
        for i in range(17, len(arr)):
            if (i - 8) % 16 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Receiving Yards" and pos == "RB":
        for i in range(17, len(arr)):
            if (i - 11) % 16 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Rush Yards" and pos == "QB":
        arr = nflprop_qbrush(name, team)
        for i in range(17, len(arr)):
            if (i - 4) % 16 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "FG Made" and pos == "K":
        for i in range(14, len(arr)):
            if (i - 8) % 13 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
    elif stat == "Rush+Rec TDs" and pos == "RB":
        for i in range(17, len(arr)):
            if (i - 10) % 16 == 0:
                stat1.append(arr[i])
        stat2 = [s.replace(" ", "") for s in stat1]
        stat3 = [int(x) for x in stat2]
        for i in range(17, len(arr)):
            if (i - 15) % 16 == 0:
                stat4.append(arr[i])
        stat5 = [s.replace(" ", "") for s in stat4]
        stat6 = [int(x) for x in stat5]
        arr3 = [x + y for x, y in zip(stat3, stat6)]
    elif stat == "Rush+Rec Yds" and pos == "RB":
        for i in range(17, len(arr)):
            if (i - 7) % 16 == 0:
                stat1.append(arr[i])
        stat2 = [s.replace(" ", "") for s in stat1]
        stat3 = [int(x) for x in stat2]
        for i in range(17, len(arr)):
            if (i - 11) % 16 == 0:
                stat4.append(arr[i])
        stat5 = [s.replace(" ", "") for s in stat4]
        stat6 = [int(x) for x in stat5]
        arr3 = [x + y for x, y in zip(stat3, stat6)]
    elif stat == "Rush+Rec Yds" and (pos == "WR" or pos == "TE"):
        for i in range(17, len(arr)):
            if (i - 9) % 16 == 0:
                stat1.append(arr[i])
        stat2 = [s.replace(" ", "") for s in stat1]
        stat3 = [int(x) for x in stat2]
        for i in range(17, len(arr)):
            if (i - 12) % 16 == 0:
                stat4.append(arr[i])
        stat5 = [s.replace(" ", "") for s in stat4]
        stat6 = [int(x) for x in stat5]
        arr3 = [x + y for x, y in zip(stat3, stat6)]
    elif stat == "Pass+Rush Yds":
        for i in range(21, len(arr)):
            if (i - 10) % 19 == 0:
                stat1.append(arr[i])
        stat2 = [s.replace(" ", "") for s in stat1]
        stat3 = [int(x) for x in stat2]
        arr = nflprop_qbrush(name, team)
        for i in range(17, len(arr)):
            if (i - 4) % 16 == 0:
                stat4.append(arr[i])
        stat5 = [s.replace(" ", "") for s in stat4]
        stat6 = [int(x) for x in stat5]
        arr3 = [x + y for x, y in zip(stat3, stat6)]
    

    return arr3
def stats_against_team_t_season(name, team, timeframe):
    if team == "MIN":
        team = "Minesota"

    if name == "Nicolas Claxton":
        name = "Claxton"
    url = f'https://www.statmuse.com/nba/ask/{name}-against-{team}-{timeframe}-including playoffs'
    html_text = requests.get(url).text
    soup = BeautifulSoup(html_text, 'lxml')
    table = soup.find('table', class_='whitespace-nowrap w-full')
    stats = []
    if not table:
        return stats
    else:
        for row in table.find_all("tr"):
            cells = row.findAll("td")
            if cells == []:
                cells = row.find_all("th")
            for i in cells:
                stat = i.text
                stats.append(stat)
        final = truncate_list_after_two_empty_elements(stats)
    return final
def nfl_stat(name, stat, team, pos, arr):
    """
    Extract NFL statistics with optimized lookup-based approach.
    """
    try:
        # Use centralized team mapping function
        team = get_nfl_team_name(team)
        if(name=="D.J. Moore"):
            name = "DJ Moore"
        # Define stat configuration lookup table
        # Format: (stat_name, position) -> (start_range, offset, modulo, data_type, use_qbrush)
        STAT_CONFIGS = {
            # QB stats (modulo 19, start at 21)
            ("Pass Yards", "QB"): (21, 10, 19, int, False),
            ("Pass TDs", "QB"): (21, 12, 19, int, False),
            ("Pass Completions", "QB"): (21, 7, 19, int, False),
            ("Completion Percentage", "QB"): (21, 9, 19, float, False),
            ("Pass Attempts", "QB"): (21, 8, 19, int, False),
            ("INT", "QB"): (21, 13, 19, int, False),
            ("Rush Yards", "QB"): (17, 4, 16, int, True),  # Uses qbrush
            ("Rush TDs", "QB"): (17, 10, 16, int, True),
            ("Rush Attempts", "QB"): (17, 8, 16, int, True),
            # WR/TE stats (modulo 16, start at 17)
            ("Receiving Yards", "WR"): (17, 9, 16, int, False),
            ("Receiving Yards", "TE"): (17, 9, 16, int, False),
            ("Rec Targets", "WR"): (17, 8, 16, int, False),
            ("Rec Targets", "TE"): (17, 8, 16, int, False),
            ("Receptions", "WR"): (17, 7, 16, int, False),
            ("Receptions", "TE"): (17, 7, 16, int, False),
            
            # RB stats (modulo 16, start at 17)
            ("Rush Yards", "RB"): (17, 7, 16, int, False),
            ("Rush Attempts", "RB"): (17, 8, 16, int, False),
            ("Receiving Yards", "RB"): (17, 11, 16, int, False),
            ("Receptions", "RB"): (17, 12, 16, int, False),
            ("Rec Targets", "RB"): (17, 13, 16, int, False),
            ("Rush yards Per Carry", "RB"): (17, 9, 16, float, False),
            # K stats (modulo 13, start at 14)
            ("FG Made", "K"): (14, 8, 13, int, False),
        }
        
        # Get the appropriate data array
        config = STAT_CONFIGS.get((stat, pos))
        if config and config[4]:  # use_qbrush
            arr = nflprop_qbrush(name, team)
        # Create prop context for error reporting
        prop_context = (name, stat, team, pos)
        
        # Handle special combined stats that need both passing and rushing data
        if stat == "Rush+Rec TDs" and pos == "QB":
            # For QB, combine passing TDs and rushing TDs
            rush_arr = nflprop_qbrush(name, team)
            rush_tds = _extract_stats(rush_arr, 17, 10, 16, int, prop_context)  # Rushing TDs
            return [int(x) for x in rush_tds]
        
        elif stat == "Rush+Rec Yds" and pos == "QB":
            # For QB, combine passing yards and rushing yards
            rush_arr = nflprop_qbrush(name, team)
            rush_yds = _extract_stats(rush_arr, 17, 4, 16, int, prop_context)  # Rushing yards
            return [int(x) for x in rush_yds]
        
        elif stat == "Pass+Rush Yds":
            pass_yds = _extract_stats(arr, 21, 10, 19, int, prop_context)
            rush_arr = nflprop_qbrush(name, team)
            rush_yds = _extract_stats(rush_arr, 17, 4, 16, int, prop_context)
            return [x + y for x, y in zip(pass_yds, rush_yds)]
        
        # Handle other position combined stats
        elif stat == "Rush+Rec TDs" and pos == "RB":
            rush_tds = _extract_stats(arr, 17, 10, 16, int, prop_context)
            rec_tds = _extract_stats(arr, 17, 15, 16, int, prop_context)
            return [x + y for x, y in zip(rush_tds, rec_tds)]
        
        elif stat == "Rush+Rec TDs" and (pos == "WR" or pos == "TE"):
            # For WR/TE, Rush+Rec TDs is just receiving TDs (offset 11)
            return _extract_stats(arr, 17, 11, 16, int, prop_context)
        
        elif stat == "Rush+Rec Yds" and pos == "RB":
            rush_yds = _extract_stats(arr, 17, 7, 16, int, prop_context)
            rec_yds = _extract_stats(arr, 17, 11, 16, int, prop_context)
            return [x + y for x, y in zip(rush_yds, rec_yds)]
        
        elif stat == "Rush+Rec Yds" and (pos == "WR" or pos == "TE"):
            # For WR/TE, Rush+Rec Yds is just receiving yards (offset 9)
            return _extract_stats(arr, 17, 9, 16, int, prop_context)
        elif stat == "Kicking Points" and (pos == "K"):
            fg_made = _extract_stats(arr, 14, 8, 13, int, prop_context)
            extra_point_made = _extract_stats(arr, 14, 11, 13, int, prop_context)
            return [x * 3 + y for x, y in zip(fg_made, extra_point_made)]
        
        # Handle regular stats using lookup table
        if config:
            start_range, offset, modulo, data_type, _ = config
            return _extract_stats(arr, start_range, offset, modulo, data_type, prop_context)
        
        # If no configuration found, return empty list
        print(f"[WARNING] No configuration found for stat '{stat}' and position '{pos}'")
        return []
        
    except Exception as e:
        print(f"[ERROR] Error in nfl_stat for player '{name}', stat '{stat}', team '{team}', position '{pos}': {e}")
        return []
def _extract_stats(arr, start_range, offset, modulo, data_type, prop_context=None):
    """
    Extract statistics from array using optimized list comprehension.
    """
    try:
        # Use list comprehension for better performance
        extracted = [arr[i] for i in range(start_range, len(arr)) if (i - offset) % modulo == 0]
        
        # Clean strings and convert to appropriate type
        cleaned = [s.replace(" ", "") for s in extracted]
        
        # Filter out empty strings before conversion
        cleaned = [s for s in cleaned if s.strip()]
        
        if data_type == float:
            return [float(x) for x in cleaned]
        else:
            return [int(x) for x in cleaned]
            
    except (ValueError, IndexError) as e:
        if prop_context:
            player, stat, team, pos = prop_context
            print(f"[WARNING] Error extracting stats for player '{player}', stat '{stat}', team '{team}', position '{pos}': {e}")
        else:
            print(f"[WARNING] Error extracting stats: {e}")
        print(f"[DEBUG] Array length: {len(arr)}, start_range: {start_range}, offset: {offset}, modulo: {modulo}")
        print(f"[DEBUG] Extracted values: {extracted}")
        print(f"[DEBUG] Cleaned values: {cleaned}")
        return []
print(nfl_stat("bo nix", "Rush Yards", "BAL", "RB", []))

def against_team(team):
    html_text = requests.get(f'https://www.statmuse.com/nba/ask/what-team-are-the-{team}-playing-next').text
    soup = BeautifulSoup(html_text, 'lxml')
    opp = soup.find('span',
                        class_='my-[1em] [&>a]:underline [&>a]:text-team-secondary whitespace-pre-wrap text-pretty')
    if not opp:
        print(f"[ERROR] Couldn't find opponent for {team}")
        return None  # Or return a default string like "Unknown"
    opp = opp.text

    # Determine the start index based on '@ ' or 'vs '
    start_index = opp.find('@ ')
    if start_index != -1:
        start_index += 2  # Move index to after '@ '
    else:
        start_index = opp.find('vs ')
        if start_index != -1:
            start_index += 3  # Move index to after 'vs '

    # Find the position of the next space after '@ ' or 'vs '
    if start_index != -1:
        end_index = opp.find(' ', start_index)
        if end_index == -1:  # If no space found, use the rest of the string
            end_index = len(opp)

        # Extract and print the substring
        substring = opp[start_index:end_index].strip()

        # Check and return the opponent's name
        if substring.upper() != "MIN":
            return substring
        else:
            return "minnesota"

    return None
def find_stat(num,arr):
    arr1 = []
    arr2 = []
    arr3 = []
    try:
        for i in range(28, len(arr)):
            if (i - num) % 28 == 0:
                arr1.append(arr[i])
        arr2 = [s.replace(" ", "") for s in arr1]
        arr3 = [int(x) for x in arr2]
        return arr3
    except (ValueError, IndexError) as e:
        print(f"[WARNING] Error in find_stat: {e}")
        print(f"[DEBUG] Array length: {len(arr)}, modulo: {num}")
        print(f"[DEBUG] Extracted values: {arr1}")
        print(f"[DEBUG] Cleaned values: {arr2}")
        return []
def specific_stat_vs_opp_games_arr(arr,stat):
    try:
        arr1 = []
        arr3 = []
        'return list above'

        stat1 = []
        stat4 = []
        stat7 = []
        if stat == "Points":
            arr3 = find_stat(8, arr)
        elif stat == "Min":
            arr3 = find_stat(7, arr)
        elif stat == "Rebounds":
            arr3 = find_stat(9, arr)
        elif stat == "Assists":
            arr3 = find_stat(10, arr)
        elif stat == "Steals":
            arr3 = find_stat(11, arr)
        elif stat == "Blocked Shots":
            arr3 = find_stat(12, arr)
        elif stat == "Turnovers":
            arr3 = find_stat(25, arr)
        elif stat == "fgm":
            arr3 = find_stat(13, arr)
        elif stat == "FG Attempted":
            arr3 = find_stat(14, arr)
        elif stat == "3-PT Made":
            arr3 = find_stat(16, arr)
        elif stat == "3-PT Attempted":
            arr3 = find_stat(17, arr)
        elif stat == "Free Throws Made":
            arr3 = find_stat(19, arr)
        elif stat == "Offensive Rebounds":
            '''arr = stats_against_team_t_season_oreb(name, team)'''
            arr3 = find_stat(23, arr)
        elif stat == "Defensive Rebounds":
            '''arr = stats_against_team_t_season_dreb(name, team)'''
            arr3 = find_stat(24, arr)
        elif stat == "Pts+Rebs":
            stat3 = find_stat(8, arr)
            stat6 = find_stat(9, arr)
            arr3 = [x + y for x, y in zip(stat3, stat6)]
        elif stat == "Pts+Asts":
            stat3 = find_stat(8, arr)
            stat6 = find_stat(10, arr)
            arr3 = [x + y for x, y in zip(stat3, stat6)]
        elif stat == "Rebs+Asts":
            stat3 = find_stat(9, arr)
            stat6 = find_stat(10, arr)
            arr3 = [x + y for x, y in zip(stat3, stat6)]
        elif stat == "Blks+Stls":
            stat3 = find_stat(11, arr)
            stat6 = find_stat(12, arr)
            arr3 = [x + y for x, y in zip(stat3, stat6)]
        elif stat == "Pts+Rebs+Asts":
            stat3 = find_stat(8, arr)
            stat6 = find_stat(9, arr)
            stat9 = find_stat(10, arr)

            arr3 = [x + y + z for x, y, z in zip(stat3, stat6, stat9)]

        return arr3
    except Exception as e:
        print(f"[ERROR] Error in specific_stat_vs_opp_games_arr for stat '{stat}': {e}")
        return []
def specific_stat_l10_games(arr,stat):
    try:
        arr1 = []
        arr3 = []
        'return list above'

        stat1 = []
        stat4 = []
        stat7 = []
        if stat == "Points":
            arr3 = find_stat(8, arr)
        elif stat == "Min":
            arr3 = find_stat(7, arr)
        elif stat == "Rebounds":
            arr3 = find_stat(9, arr)
        elif stat == "Assists":
            arr3 = find_stat(10, arr)
        elif stat == "Steals":
            arr3 = find_stat(11, arr)
        elif stat == "Blocked Shots":
            arr3 = find_stat(12, arr)
        elif stat == "Turnovers":
            arr3 = find_stat(25, arr)
        elif stat == "FG Made":
            arr3 = find_stat(13, arr)
        elif stat == "FG Attempted":
            arr3 = find_stat(14, arr)
        elif stat == "3-PT Made":
            arr3 = find_stat(16, arr)
        elif stat == "3-PT Attempted":
            arr3 = find_stat(17, arr)
        elif stat == "Free Throws Made":
            arr3 = find_stat(19, arr)
        elif stat == "Offensive Rebounds":
            '''arr = stats_against_team_t_season_oreb(name, team)'''
            arr3 = find_stat(23, arr)
        elif stat == "Defensive Rebounds":
            '''arr = stats_against_team_t_season_dreb(name, team)'''
            arr3 = find_stat(24, arr)
        elif stat == "Pts+Rebs":
            stat3 = find_stat(8, arr)
            stat6 = find_stat(9, arr)
            arr3 = [x + y for x, y in zip(stat3, stat6)]
        elif stat == "Pts+Asts":
            stat3 = find_stat(8, arr)
            stat6 = find_stat(10, arr)
            arr3 = [x + y for x, y in zip(stat3, stat6)]
        elif stat == "Rebs+Asts":
            stat3 = find_stat(9, arr)
            stat6 = find_stat(10, arr)
            arr3 = [x + y for x, y in zip(stat3, stat6)]
        elif stat == "Blks+Stls":
            stat3 = find_stat(11, arr)
            stat6 = find_stat(12, arr)
            arr3 = [x + y for x, y in zip(stat3, stat6)]
        elif stat == "Pts+Rebs+Asts":
            stat3 = find_stat(8, arr)
            stat6 = find_stat(9, arr)
            stat9 = find_stat(10, arr)

            arr3 = [x + y + z for x, y, z in zip(stat3, stat6, stat9)]

        return arr3
    except Exception as e:
        print(f"[ERROR] Error in specific_stat_l10_games for stat '{stat}': {e}")
        return []

    if team == "MIN":
        team = "Minesota"
    html_text = requests.get(f'https://www.statmuse.com/nba/ask/{name}-against-{team}-{timeframe}').text
    soup = BeautifulSoup(html_text, 'lxml')
    table = soup.find('table', class_='whitespace-nowrap w-full')
    stats = []
    if not table:
        return stats
    else:
        for row in table.find_all("tr"):
            cells = row.findAll("td")
            if cells == []:
                cells = row.find_all("th")
            for i in cells:
                stat = i.text
                stats.append(stat)
        final = truncate_list_after_two_empty_elements(stats)
    return final
def stats_ten_games(name):
    if name == "Nicolas Claxton":
        name = "Claxton"
    html_text = requests.get(f'https://www.statmuse.com/nba/ask/{name}-last-10-games').text
    soup = BeautifulSoup(html_text, 'lxml')
    table = soup.find('table', class_='whitespace-nowrap w-full')
    stats = []
    if not table:
        return stats
    else:
        for row in table.find_all("tr"):
            cells = row.findAll("td")
            if cells == []:
                cells = row.find_all("th")
            for i in cells:
                stat = i.text
                stats.append(stat)
        final = truncate_list_after_two_empty_elements(stats)
    return final

def nfl_stat_L5(name, stat, team, pos, arr):
    """
    Extract NFL statistics with optimized lookup-based approach.
    """
    try:
        # Use centralized team mapping function
        team = get_nfl_team_name(team)
        if(name=="D.J. Moore"):
            name = "DJ Moore"
        # Define stat configuration lookup table
        # Format: (stat_name, position) -> (start_range, offset, modulo, data_type, use_qbrush)
        STAT_CONFIGS = {
            # QB stats (modulo 19, start at 21)
            ("Pass Yards", "QB"): (21, 10, 19, int, False),
            ("Pass TDs", "QB"): (21, 12, 19, int, False),
            ("Pass Completions", "QB"): (21, 7, 19, int, False),
            ("Completion Percentage", "QB"): (21, 9, 19, float, False),
            ("Pass Attempts", "QB"): (21, 8, 19, int, False),
            ("INT", "QB"): (21, 13, 19, int, False),
            ("Rush Yards", "QB"): (17, 4, 16, int, True),  # Uses qbrush
            ("Rush TDs", "QB"): (17, 10, 16, int, True),
            ("Rush Attempts", "QB"): (17, 8, 16, int, True),
            # WR/TE stats (modulo 16, start at 17)
            ("Receiving Yards", "WR"): (17, 9, 16, int, False),
            ("Receiving Yards", "TE"): (17, 9, 16, int, False),
            ("Rec Targets", "WR"): (17, 8, 16, int, False),
            ("Rec Targets", "TE"): (17, 8, 16, int, False),
            ("Receptions", "WR"): (17, 7, 16, int, False),
            ("Receptions", "TE"): (17, 7, 16, int, False),
            
            # RB stats (modulo 16, start at 17)
            ("Rush Yards", "RB"): (17, 7, 16, int, False),
            ("Rush Attempts", "RB"): (17, 8, 16, int, False),
            ("Receiving Yards", "RB"): (17, 11, 16, int, False),
            ("Receptions", "RB"): (17, 12, 16, int, False),
            ("Rec Targets", "RB"): (17, 13, 16, int, False),
            ("Rush yards Per Carry", "RB"): (17, 9, 16, float, False),
            # K stats (modulo 13, start at 14)
            ("FG Made", "K"): (14, 8, 13, int, False),
        }
        # Get the appropriate data array
        config = STAT_CONFIGS.get((stat, pos))
        if config and config[4]:  # use_qbrush_l5
            arr = nflprop_qbrush_l5(name)
        # Create prop context for error reporting
        prop_context = (name, stat, team, pos)
        
        # Handle special combined stats that need both passing and rushing data
        if stat == "Rush+Rec TDs" and pos == "QB":
            # For QB, combine passing TDs and rushing TDs
            rush_arr = nflprop_qbrush_l5(name)
            rush_tds = _extract_stats(rush_arr, 17, 10, 16, int, prop_context)  # Rushing TDs
            return [int(x) for x in rush_tds]
        
        elif stat == "Rush+Rec Yds" and pos == "QB":
            # For QB, combine passing yards and rushing yards
            rush_arr = nflprop_qbrush_l5(name)
            rush_yds = _extract_stats(rush_arr, 17, 4, 16, int, prop_context)  # Rushing yards
            return [int(x) for x in rush_yds]
        
        elif stat == "Pass+Rush Yds":
            pass_yds = _extract_stats(arr, 21, 10, 19, int, prop_context)
            rush_arr = nflprop_qbrush_l5(name)
            rush_yds = _extract_stats(rush_arr, 17, 4, 16, int, prop_context)
            return [x + y for x, y in zip(pass_yds, rush_yds)]
        
        # Handle other position combined stats
        elif stat == "Rush+Rec TDs" and pos == "RB":
            rush_tds = _extract_stats(arr, 17, 10, 16, int, prop_context)
            rec_tds = _extract_stats(arr, 17, 15, 16, int, prop_context)
            return [x + y for x, y in zip(rush_tds, rec_tds)]
        
        elif stat == "Rush+Rec TDs" and (pos == "WR" or pos == "TE"):
            # For WR/TE, Rush+Rec TDs is just receiving TDs (offset 11)
            return _extract_stats(arr, 17, 11, 16, int, prop_context)
        
        elif stat == "Rush+Rec Yds" and pos == "RB":
            rush_yds = _extract_stats(arr, 17, 7, 16, int, prop_context)
            rec_yds = _extract_stats(arr, 17, 11, 16, int, prop_context)
            return [x + y for x, y in zip(rush_yds, rec_yds)]
        
        elif stat == "Rush+Rec Yds" and (pos == "WR" or pos == "TE"):
            # For WR/TE, Rush+Rec Yds is just receiving yards (offset 9)
            return _extract_stats(arr, 17, 9, 16, int, prop_context)
        elif stat == "Kicking Points" and (pos == "K"):
            fg_made = _extract_stats(arr, 14, 8, 13, int, prop_context)
            extra_point_made = _extract_stats(arr, 14, 11, 13, int, prop_context)
            return [x * 3 + y for x, y in zip(fg_made, extra_point_made)]
        # Handle regular stats using lookup table
        if config:
            start_range, offset, modulo, data_type, _ = config
            return _extract_stats(arr, start_range, offset, modulo, data_type, prop_context)
        
        # If no configuration found, return empty list
        print(f"[WARNING] No configuration found for stat '{stat}' and position '{pos}'")
        return []
        
    except Exception as e:
        print(f"[ERROR] Error in nfl_stat_L5 for player '{name}', stat '{stat}', team '{team}', position '{pos}': {e}")
        return []
print(nfl_stat_L5("Bo Nix", "Rush Yards", "NE", "QB", [nflprop_l5("Bo Nix")]))