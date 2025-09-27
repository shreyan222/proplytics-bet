#!/usr/bin/env python3
"""
NFL Matchup Rankings Generator

This script runs the NFL defense scraper and generates matchup rankings
that can be used by enhanced_main.py. Run this script periodically to
update the rankings data.

Usage:
    python generate_nfl_rankings.py

Output:
    - nfl_defense_vs_pos.csv (raw defense data)
    - nfl_defense_vs_pos.json (raw defense data)
    - nfl_generated_matchup_rankings.json (processed rankings for props)
"""

import sys
import os
import json
from datetime import datetime

# Add the current directory to the path (we're already in data_scraper&analyzer)
sys.path.append(os.path.dirname(__file__))

try:
    from nfl import NFLDefenseScraper
except ImportError as e:
    print(f"❌ Error importing NFL scraper: {e}")
    print("Make sure you have the required dependencies installed:")
    print("pip install requests beautifulsoup4 pandas")
    sys.exit(1)

def generate_matchup_rankings():
    """Generate NFL matchup rankings by scraping defense data"""
    print("🏈 NFL Matchup Rankings Generator")
    print("=" * 50)
    
    # Initialize scraper
    scraper = NFLDefenseScraper()
    
    # Scrape defense data
    print("📡 Scraping NFL defense vs position data...")
    defense_data = scraper.scrape_defense_data()
    
    if not defense_data:
        print("❌ Failed to scrape defense data")
        return False
    
    print(f"✅ Scraped data for {len(defense_data)} teams")
    
    # Save raw data
    scraper.save_to_csv(defense_data)
    scraper.save_to_json(defense_data)
    print("💾 Saved raw defense data to CSV and JSON files")
    
    # Generate matchup rankings
    print("⚙️ Processing data into matchup rankings...")
    matchup_rankings = scraper.create_matchup_rankings(defense_data)
    
    if not matchup_rankings:
        print("❌ Failed to create matchup rankings")
        return False
    
    # Create the final rankings file structure
    rankings_data = {
        "_metadata": {
            "description": "Auto-generated NFL Matchup Rankings from defense data",
            "ranking_scale": "1-32 where 1 = best matchup (worst defense), 32 = worst matchup (best defense)",
            "generated_at": datetime.now().isoformat(),
            "source": "draftedge.com/nfl/nfl-defense-vs-pos/",
            "teams_count": len(matchup_rankings),
            "total_rankings": sum(len(team_data) for team_data in matchup_rankings.values())
        },
        "team_rankings": {}
    }
    
    # Convert the flat structure to organized position-based structure
    for team_name, team_data in matchup_rankings.items():
        organized_team_data = {
            "QB": {},
            "RB": {},
            "WR": {},
            "TE": {}
        }
        
        # Organize stats by position
        for stat_key, rank in team_data.items():
            if stat_key.startswith("QB_"):
                stat_name = stat_key.replace("QB_", "")
                organized_team_data["QB"][stat_name] = rank
            elif stat_key.startswith("RB_"):
                stat_name = stat_key.replace("RB_", "")
                organized_team_data["RB"][stat_name] = rank
            elif stat_key.startswith("WR_"):
                stat_name = stat_key.replace("WR_", "")
                organized_team_data["WR"][stat_name] = rank
            elif stat_key.startswith("TE_"):
                stat_name = stat_key.replace("TE_", "")
                organized_team_data["TE"][stat_name] = rank
        
        rankings_data["team_rankings"][team_name] = organized_team_data
    
    # Save the generated rankings
    output_file = "nfl_generated_matchup_rankings.json"
    with open(output_file, 'w') as f:
        json.dump(rankings_data, f, indent=2)
    
    print(f"✅ Generated matchup rankings saved to: {output_file}")
    print(f"📊 Created rankings for {len(matchup_rankings)} teams")
    print(f"📈 Total rankings: {rankings_data['_metadata']['total_rankings']}")
    
    # Show some sample rankings
    print("\n📋 Sample Rankings:")
    sample_teams = list(matchup_rankings.keys())[:3]
    for team in sample_teams:
        team_data = rankings_data["team_rankings"][team]
        print(f"\n  {team}:")
        for position in ["QB", "RB"]:
            if position in team_data and team_data[position]:
                sample_stat = list(team_data[position].items())[0]
                stat_name, rank = sample_stat
                matchup_quality = "🟢 Great" if rank <= 8 else "🟡 Good" if rank <= 16 else "🟠 Fair" if rank <= 24 else "🔴 Poor"
                print(f"    {position} {stat_name}: {rank}/32 ({matchup_quality})")
    
    print(f"\n🎉 Rankings generation complete!")
    print(f"💡 Now run enhanced_main.py to use these rankings for props analysis")
    
    return True

def main():
    """Main function"""
    try:
        success = generate_matchup_rankings()
        if success:
            print(f"\n✅ SUCCESS: NFL matchup rankings generated successfully!")
            print(f"📁 Files created:")
            print(f"   - nfl_defense_vs_pos.csv (raw data)")
            print(f"   - nfl_defense_vs_pos.json (raw data)")
            print(f"   - nfl_generated_matchup_rankings.json (processed rankings)")
            print(f"\n🚀 Next steps:")
            print(f"   1. Review the generated rankings if needed")
            print(f"   2. Run enhanced_main.py to process props with these rankings")
        else:
            print(f"\n❌ FAILED: Could not generate NFL matchup rankings")
            print(f"💡 Troubleshooting:")
            print(f"   - Check your internet connection")
            print(f"   - Verify the NFL defense website is accessible")
            print(f"   - Make sure you have required dependencies installed")
            return 1
            
    except KeyboardInterrupt:
        print(f"\n⏹️ Rankings generation cancelled by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
