# Add this debug output right after line 1000 in enhanced_main.py

# Debug: Show sample prop data
print(f"📝 Sample prop data:")
for i, prop in enumerate(props[:3]):
    print(f"   Prop {i}: {prop.player_name} - {prop.stat_type} {prop.line_score} ({prop.odds_type})")

# Debug: Show sample norm data
print(f"📝 Sample norm data:")
for i in range(min(3, len(name))):
    print(f"   Row {i}: {name[i]} - {stat[i]} {line[i]} ({odds[i]})")

# Debug: Check for nan values
nan_count = sum(1 for n in name if pd.isna(n) or str(n).lower() == 'nan')
print(f"⚠️ Found {nan_count} nan values in norm names out of {len(name)} total")
