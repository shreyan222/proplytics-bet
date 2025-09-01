#!/usr/bin/env python3
"""
Test script to verify the uploader credentials fix
"""

from enhanced_main import EnhancedPropsProcessor
import os

def main():
    print("🧪 Testing Uploader Credentials Fix")
    print("=" * 50)
    
    # Create processor
    processor = EnhancedPropsProcessor()
    
    # Check uploader status
    print("\n📊 Uploader Status:")
    print(f"  Enabled: {processor.uploader.enabled}")
    print(f"  URL: {processor.uploader.supabase_url}")
    print(f"  Endpoint: {processor.uploader.ingestion_endpoint}")
    print(f"  Configured: {processor.uploader.is_configured()}")
    
    # Test manual credential setting
    print("\n🔧 Testing manual credential setting...")
    test_url = "https://test-project.supabase.co"
    test_key = "test-key-123"
    processor.set_credentials(test_url, test_key)
    
    print(f"  Enabled: {processor.uploader.enabled}")
    print(f"  URL: {processor.uploader.supabase_url}")
    print(f"  Endpoint: {processor.uploader.ingestion_endpoint}")
    print(f"  Configured: {processor.uploader.is_configured()}")
    
    # Test reloading from environment
    print("\n🔄 Testing reload from environment...")
    processor.reload_uploader_credentials()
    
    print(f"  Enabled: {processor.uploader.enabled}")
    print(f"  URL: {processor.uploader.supabase_url}")
    print(f"  Endpoint: {processor.uploader.ingestion_endpoint}")
    print(f"  Configured: {processor.uploader.is_configured()}")
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    main()
