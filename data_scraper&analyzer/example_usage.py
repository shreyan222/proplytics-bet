#!/usr/bin/env python3
"""
Example usage of the Enhanced Props Processor with Supabase integration

This script shows how to properly set up credentials and use the system.
"""

from enhanced_main import EnhancedPropsProcessor
import os

def main():
    print("🚀 Enhanced Props Processor Example")
    print("=" * 50)
    
    # Method 1: Set credentials manually
    print("\n1. Setting credentials manually...")
    processor = EnhancedPropsProcessor()
    
    # You can set credentials manually if needed
    # processor.set_credentials(
    #     url="https://your-project.supabase.co",
    #     key="your-supabase-anon-key"
    # )
    
    # Method 2: Use environment variables
    print("\n2. Checking environment variables...")
    if os.environ.get('SUPABASE_URL') and os.environ.get('SUPABASE_KEY'):
        print("✅ Environment variables are set")
        print(f"URL: {os.environ.get('SUPABASE_URL')}")
        print(f"Key: ***{os.environ.get('SUPABASE_KEY')[-4:]}")
    else:
        print("❌ Environment variables not set")
        print("You can set them with:")
        print("export SUPABASE_URL='https://your-project.supabase.co'")
        print("export SUPABASE_KEY='your-supabase-anon-key'")
    
    # Method 3: Create .env file
    print("\n3. Checking for .env file...")
    if os.path.exists('.env'):
        print("✅ .env file found")
        print("Make sure it contains:")
        print("SUPABASE_URL=https://your-project.supabase.co")
        print("SUPABASE_KEY=your-supabase-anon-key")
    else:
        print("❌ .env file not found")
        print("You can create one with your credentials")
    
    # Check credentials status
    print("\n4. Checking credentials status...")
    processor.check_credentials_status()
    
    # Test database connection
    print("\n5. Testing database connection...")
    if processor.test_database_connection():
        print("✅ Database connection successful!")
        
        # Run a processing cycle
        print("\n6. Running processing cycle...")
        processor.run_processing_cycle()
    else:
        print("❌ Database connection failed!")
        print("Please check your credentials and try again")
    
    print("\n" + "=" * 50)
    print("Example completed!")

if __name__ == "__main__":
    main()
