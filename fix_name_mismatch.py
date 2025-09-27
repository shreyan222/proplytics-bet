"""
Fix for the name mismatch issue in enhanced_main.py

The problem: Props have valid names, but CSV data has nan values
The solution: Use props as source of truth, match by other attributes
"""

# Instead of trying to match by name from CSV, we should:
# 1. Use props as the primary data source
# 2. Match props to CSV rows by stat_type, line_score, odds_type, team_name
# 3. Skip the problematic name matching entirely

# Replace the problematic matching logic with:

def create_robust_prop_mapping(props, norm):
    """Create a more robust mapping that doesn't rely on CSV names"""
    prop_map = {}
    
    # Create CSV lookup by other attributes (skip name)
    csv_rows = []
    for i, row in norm.iterrows():
        csv_rows.append({
            'index': i,
            'stat_type': row['Stat Type'],
            'line_score': row['Line Score'], 
            'odds_type': row['Odds Type'],
            'team_name': row['Team Name'],
            'game_id': row['Game ID']
        })
    
    # Match props to CSV rows by attributes other than name
    for prop in props:
        for csv_row in csv_rows:
            if (prop.stat_type == csv_row['stat_type'] and 
                prop.line_score == csv_row['line_score'] and
                prop.odds_type == csv_row['odds_type'] and
                prop.team_name == csv_row['team_name']):
                
                prop_map[csv_row['index']] = prop
                break
    
    return prop_map

# This approach uses props as source of truth and avoids the nan name issue
