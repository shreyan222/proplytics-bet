#!/usr/bin/env python3
"""
Simple Props Processor Runner
Runs the simplified workflow on a schedule
"""

import time
import schedule
import threading
from enhanced_main_simple import SimplePropsProcessor

def run_processing():
    """Run the processing workflow"""
    processor = SimplePropsProcessor()
    processor.run()

def start_scheduler():
    """Start the background scheduler"""
    print("🚀 Starting Simple Props Processor Scheduler...")
    
    # Schedule processing every 60 minutes
    schedule.every(60).minutes.do(run_processing)
    
    # Run initial processing
    print("🔄 Running initial processing...")
    run_processing()
    
    # Start scheduler in background
    def run_scheduler():
        while True:
            schedule.run_pending()
            time.sleep(60)
    
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    
    print("📅 Scheduler started - processing every 60 minutes")
    
    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down scheduler...")

if __name__ == "__main__":
    start_scheduler()
