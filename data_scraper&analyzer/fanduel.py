import requests
from bs4 import BeautifulSoup
import pandas as pd
# Display all rows and columns when printing
'''pd.set_option('display.max_rows', None)  # None means no limit on rows
pd.set_option('display.max_columns', None)  # None means no limit on columns
pd.set_option('display.width', None)  # Adjust the width to fit all content
pd.set_option('display.max_colwidth', None)  # Adjust column width for long text'''

# URL to scrape
url = "https://www.fantasypros.com/daily-fantasy/nba/fanduel-defense-vs-position.php"

response = requests.get(url)
response.raise_for_status()
soup = BeautifulSoup(response.text, 'html.parser')
time_period = soup.find('h1').find_next('p').text.strip()
table = soup.find('table', {'id': 'data-table'})
headers = [header.text.strip() for header in table.find_all('th')]
matchup_data = []
for row in table.find_all('tr')[1:]:
    columns = row.find_all('td')
    team = columns[0].text.strip()[:3]  # First column is the team name
    matchups = [col.text.strip() for col in columns[1:]]
    # Add rows to matchup_data, grouping by team
    matchup_data.append((team, matchups))

# Create a dictionary to group matchups by team name
team_matchup_dict = {}
for team, matchups in matchup_data:
    if team not in team_matchup_dict:
        team_matchup_dict[team] = []
    team_matchup_dict[team].append(matchups)

# Remove the last 4 entries for each team
for team in team_matchup_dict:
    team_matchup_dict[team] = team_matchup_dict[team][:-4]  # Exclude last 4 matchups

# Flatten the dictionary back into a list for output
filtered_matchup_data = []
for team, matchups_list in team_matchup_dict.items():
    for matchups in matchups_list:
        filtered_matchup_data.append((team, matchups))

# Print filtered data


# Display the data with time period and headers
print(f"Data Time Period: {time_period}")
print(f"Positions: {headers[1:]}\n")

print("Matchup Data:")
for team, matchups in filtered_matchup_data:
    print(f"{team}: {matchups}")




# Optional: Save to DataFrame and CSV
'''df = pd.DataFrame(matchup_data, columns=['Team', 'Matchups'])
df.insert(1, 'Positions', [headers[1:]] * len(matchup_data))  # Add position column for context
df.insert(2, 'Time Period', time_period)
df.to_csv('nba_matchup_data.csv', index=False)
print(df)'''
# Define categories for better organization
categories = [
    "all2024", "allL7", "allL15", "allL30", "pg2024", "pgL7", "pgL15", "pgL30",
    "sg2024", "sgL7", "sgL15", "sgL30", "sf2024", "sfL7", "sfL15", "sfL30",
    "pf2024", "pfL7", "pfL15", "pfL30", "c2024", "cL7", "cL15", "cL30"
]

# Dictionary to store extracted data dynamically
filtered_data = {
    category: [filtered_matchup_data[i] for i in range(index, len(filtered_matchup_data), 24)]
    for index, category in enumerate(categories)
}

# Example: Accessing pg2024
print(filtered_data["pg2024"])



for row in filtered_data["sfL15"]:
    print(row)
for category, data in filtered_data.items():
    print(f"{category}:")
    for row in data:
        print(row)
    print()  # Add a blank line for readability

'''
2024 all
L7 all
L15 all
L30 all
2024 pg
L7 pg
L15 pg
L30 pg
2024 sg
...
2024 sf
...
2024 pf
...
2024 C
...
(continues in this pattern)
'''