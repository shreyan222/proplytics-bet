# NFL Matchup Rankings System

## Overview
The NFL matchup rankings system provides position-specific defensive rankings for all 32 NFL teams. This helps evaluate how good a matchup each prop has based on the opposing team's defensive performance.

## Ranking Scale
- **1-32 scale** where:
  - **1 = Best matchup** (worst defense against that position/stat)
  - **32 = Worst matchup** (best defense against that position/stat)

## Workflow
1. **Generate Rankings**: Run `python generate_nfl_rankings.py` to scrape fresh data
2. **Process Props**: Run `enhanced_main.py` which will use the generated rankings

## File Structure
The rankings are stored in `nfl_generated_matchup_rankings.json` with the following structure:

```json
{
  "_metadata": {
    "description": "Manual NFL Matchup Rankings - Lower rank = better matchup for offense",
    "ranking_scale": "1-32 where 1 = best matchup (worst defense), 32 = worst matchup (best defense)",
    "last_updated": "2025-01-11",
    "season": "2024-2025"
  },
  "team_rankings": {
    "Team Name": {
      "QB": {
        "Pass Yards": 15,
        "Pass TDs": 12,
        "Pass Completions": 15,
        "Pass Attempts": 15
      },
      "RB": {
        "Rush Yards": 8,
        "Rush TDs": 10,
        "Rush Attempts": 8,
        "Rec Yards": 12,
        "Receptions": 14,
        "Rec TDs": 16
      },
      "WR": {
        "Rec Yards": 18,
        "Receptions": 20,
        "Rec TDs": 15,
        "Rush Yards": 25,
        "Rush TDs": 28
      },
      "TE": {
        "Rec Yards": 22,
        "Receptions": 24,
        "Rec TDs": 20
      }
    }
  }
}
```

## How It Works

1. **Generate Rankings**: Run `python generate_nfl_rankings.py` to scrape fresh NFL defense data
2. **Enhanced Main Script** loads the generated rankings file on startup
3. For each NFL prop, the system:
   - Identifies the opposing team
   - Looks up the team's defensive ranking for that position/stat combination
   - Assigns the matchup rank to the prop
4. **PropsTable** displays the rankings with color coding:
   - 🟢 **Green (1-8)**: Great matchups
   - 🟡 **Yellow (9-16)**: Good matchups  
   - 🟠 **Orange (17-24)**: Fair matchups
   - 🔴 **Red (25-32)**: Poor matchups

## Updating Rankings

To update the rankings with fresh data:

1. Run `python generate_nfl_rankings.py` to scrape latest defense data
2. The script will create/update `nfl_generated_matchup_rankings.json`
3. Restart enhanced_main.py to load the new rankings

## Examples

### Good Matchup
```
Derrick Henry Rush Yards vs Jacksonville Jaguars
Jaguars rank 4/32 against RB Rush Yards → Great matchup! 🟢
```

### Poor Matchup  
```
Josh Allen Pass Yards vs New England Patriots
Patriots rank 30/32 against QB Pass Yards → Poor matchup 🔴
```

## Supported Positions & Stats

- **QB**: Pass Yards, Pass TDs, Pass Completions, Pass Attempts
- **RB**: Rush Yards, Rush TDs, Rush Attempts, Rec Yards, Receptions, Rec TDs
- **WR**: Rec Yards, Receptions, Rec TDs, Rush Yards, Rush TDs
- **TE**: Rec Yards, Receptions, Rec TDs

## Fallback Logic

If a specific stat isn't found, the system uses position-based fallbacks:
- **QB** → Pass Yards → Pass TDs → Pass Completions
- **RB** → Rush Yards → Rush TDs → Rec Yards → Receptions
- **WR** → Rec Yards → Receptions → Rec TDs
- **TE** → Rec Yards → Receptions → Rec TDs

## Benefits

1. **No Web Scraping**: Rankings are manually maintained, no need to scrape websites
2. **Consistent Performance**: Fast lookup from local file
3. **Full Control**: Manually adjust rankings based on latest analysis
4. **Visual Feedback**: Color-coded display in PropsTable
5. **Score Integration**: Rankings affect prop scoring algorithm
