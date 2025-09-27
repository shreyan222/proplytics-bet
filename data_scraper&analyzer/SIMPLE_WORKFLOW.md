# Simple Props Processing Workflow

## Overview
This is the simplified, clean workflow for processing props:

```
PPapiscraper → Pickle Files → Enhanced Main → Database
```

## Files

### 1. `PPapiscraper.py` (Data Collection)
- Scrapes props from PrizePicks API
- Creates Prop objects with all basic data
- Saves to pickle files:
  - `nba_props.pkl` - NBA props
  - `nfl_props.pkl` - NFL props
- Runs every 7 minutes to keep data fresh

### 2. `enhanced_main_simple.py` (Analysis & Upload)
- Loads props from pickle files
- Checks Supabase database for existing props
- Analyzes only NEW props for H2H and L5 stats
- Uploads analyzed props to Supabase

### 3. `run_simple_processor.py` (Scheduler)
- Runs the analysis workflow every 60 minutes
- Handles scheduling and error recovery

## Workflow Steps

1. **Load Props**: Read from `nba_props.pkl` and `nfl_props.pkl`
2. **Check Database**: Query Supabase to find existing props
3. **Filter New Props**: Only process props not in database
4. **Create Opponent Mapping**: Map teams playing against each other
5. **Analyze Props**: Get H2H and L5 stats for each prop
6. **Upload**: Send analyzed props to Supabase

## Usage

### Run Once
```bash
python enhanced_main_simple.py
```

### Run with Scheduler
```bash
python run_simple_processor.py
```

## Key Features

- ✅ **Simple & Clean**: No complex filtering or data manipulation
- ✅ **Efficient**: Only processes new props
- ✅ **Robust**: Handles errors gracefully
- ✅ **Clear Logging**: Shows exactly what's happening
- ✅ **Fast**: Minimal overhead and complexity

## Configuration

The workflow uses existing configuration:
- Supabase credentials from environment variables
- Same analysis functions from `dataFinder`
- Same upload logic from `supabase_uploader`

## Monitoring

The processor shows clear status messages:
- 🚀 Starting workflow
- 📊 Loading and filtering props  
- 🏀/🏈 Analyzing NBA/NFL props
- ✅ Upload success/failure
- ❌ Error details

This replaces the complex `enhanced_main.py` with a much simpler, cleaner approach.
