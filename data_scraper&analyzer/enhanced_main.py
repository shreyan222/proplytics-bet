
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
            props = self.load_props_from_file()
            
            # Run your existing processing logic
            norm1 = PPnbapicks.RemoveSearch(PPnbapicks.filter_rows_by_league_id(df, 7), "Combo")
            norm2 = PPnbapicks.RemoveSearch(norm1, "Dunks")
            norm = PPnbapicks.RemoveSearch(norm2, "Fantasy Score")
            norm['Display Name'] = norm['Display Name'].apply(unidecode)
            
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
    
    def load_props_from_file(self, filename='nba_props.pkl'):
        """Load props from pickle file"""
        try:
            with open(filename, 'rb') as f:
                props = pickle.load(f)
                return props
        except FileNotFoundError:
            print(f"{filename} not found.")
            return []
    
    def combinetoverPropraternum2(self, num, timeframe, props, norm):
        """Your existing processing logic - simplified version"""
        # This is a simplified version of your existing function
        # You can copy your full implementation here
        print(f"Processing props for timeframe: {timeframe}")
        
        # Your existing logic here...
        # For now, just updating the props with some basic calculations
        for i, prop in enumerate(props):
            if hasattr(prop, 'player_name'):
                # Add some basic scoring logic
                prop.score = prop.score if hasattr(prop, 'score') else 0.5
                
        print(f"Processed {len(props)} props for {timeframe}")
    
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
