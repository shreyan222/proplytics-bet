#!/usr/bin/env python3
"""
Simple test script to verify Supabase connection
"""

import os
import requests

def test_supabase_connection():
    print("🔍 Testing Supabase Connection")
    print("=" * 40)
    
    # Load from .env file
    if os.path.exists('.env'):
        print("📁 Loading .env file...")
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()
        print("✅ .env file loaded")
    
    # Get credentials
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing credentials!")
        print(f"URL: {supabase_url}")
        print(f"Key: {'***' + supabase_key[-4:] if supabase_key else 'None'}")
        return False
    
    print(f"✅ Credentials found")
    print(f"URL: {supabase_url}")
    print(f"Key: ***{supabase_key[-4:]}")
    
    # Test connection with both header formats
    headers1 = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {supabase_key}'
    }
    
    headers2 = {
        'Content-Type': 'application/json',
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}'
    }
    
    test_url = f"{supabase_url}/rest/v1/props?select=id&limit=1"
    
    # Test with pagination to get more than 1000 results
    print(f"\n🔗 Testing URL: {test_url}")
    
    # Test with headers1 (Authorization only)
    print("\n📡 Test 1: Authorization header only")
    try:
        response1 = requests.get(test_url, headers=headers1, timeout=10)
        print(f"Status: {response1.status_code}")
        print(f"Response: {response1.text[:200]}...")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test with headers2 (both apikey and Authorization headers)
    print("\n📡 Test 2: Both apikey and Authorization headers")
    try:
        response2 = requests.get(test_url, headers=headers2, timeout=10)
        print(f"Status: {response2.status_code}")
        print(f"Response: {response2.text[:200]}...")
        
        if response2.status_code == 200:
            print("✅ Connection successful!")
            
            # Test pagination to get more than 1000 results
            print("\n📡 Test 3: Pagination test to get more than 1000 results")
            try:
                all_results = []
                offset = 0
                limit = 1000
                
                while True:
                    paginated_url = f"{supabase_url}/rest/v1/props?select=id&limit={limit}&offset={offset}"
                    print(f"  Fetching offset {offset}...")
                    
                    response3 = requests.get(paginated_url, headers=headers2, timeout=15)
                    if response3.status_code == 200:
                        batch_data = response3.json()
                        if not batch_data:  # No more results
                            break
                        
                        all_results.extend(batch_data)
                        print(f"  Retrieved {len(batch_data)} results (total: {len(all_results)})")
                        
                        if len(batch_data) < limit:  # Last batch
                            break
                        
                        offset += limit
                    else:
                        print(f"  Pagination failed at offset {offset}: {response3.status_code}")
                        break
                
                print(f"✅ Pagination complete: Total {len(all_results)} results retrieved")
                if len(all_results) > 1000:
                    print("🎉 Successfully retrieved more than 1000 results using pagination!")
                else:
                    print(f"⚠️ Only got {len(all_results)} results total")
                    
            except Exception as e:
                print(f"Pagination test error: {e}")
            
            return True
        else:
            print("❌ Connection failed")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = test_supabase_connection()
    if success:
        print("\n🎉 Supabase connection test passed!")
    else:
        print("\n💥 Supabase connection test failed!")
        print("\nTroubleshooting tips:")
        print("1. Check your .env file has correct credentials")
        print("2. Verify your Supabase project is active")
        print("3. Check if your API key has the right permissions")
        print("4. Try accessing your Supabase dashboard to verify the project")
