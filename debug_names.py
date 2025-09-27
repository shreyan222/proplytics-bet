import pandas as pd
import PPnbapicks

# Load the CSV data
df = pd.read_csv('Testing.csv')
print(f"Total rows in CSV: {len(df)}")
print(f"Columns: {list(df.columns)}")

# Filter for NFL data (league_id = 9)
nfl_data = PPnbapicks.filter_rows_by_league_id(df, 9)
print(f"NFL rows: {len(nfl_data)}")

if len(nfl_data) > 0:
    print(f"Sample NFL row: {nfl_data.iloc[0].to_dict()}")
    
    # Check Display Name column
    display_names = nfl_data['Display Name'].tolist()
    print(f"First 10 display names: {display_names[:10]}")
    
    # Check for nan values
    nan_count = nfl_data['Display Name'].isna().sum()
    print(f"NaN values in Display Name: {nan_count}")
    
    # Use PPnbapicks.Lists to extract names
    names_from_function = PPnbapicks.Lists(nfl_data, "Name")
    print(f"Names from PPnbapicks.Lists: {names_from_function[:10]}")
    
    # Check if they match
    print(f"Do they match? {display_names[:10] == names_from_function[:10]}")
