#!/usr/bin/env python3
"""
Configuration file for rate limiting and request management settings
"""

# Rate Limiting Configuration
RATE_LIMITING_CONFIG = {
    # Base delays between requests (in seconds)
    'base_delays': {
        'nba': 2.0,      # NBA requests
        'nfl': 2.5,      # NFL requests (slightly slower)
        'default': 2.0   # Default for other leagues
    },
    
    # Time-based adjustments
    'time_adjustments': {
        'off_hours': (2, 6),      # 2 AM - 6 AM: Can be faster
        'peak_hours': (9, 17),    # 9 AM - 5 PM: Slower
        'evening_hours': (18, 1)  # 6 PM - 1 AM: Moderate
    },
    
    # Multipliers for different time periods
    'time_multipliers': {
        'off_hours': 0.75,    # 25% faster during off-hours
        'peak_hours': 1.5,    # 50% slower during peak hours
        'evening_hours': 1.0  # Normal speed during evening
    },
    
    # Retry configuration
    'retry_config': {
        'max_retries': 3,
        'base_delay': 5,      # Base delay between retries
        'exponential_backoff': True,  # Use exponential backoff
        'max_delay': 30       # Maximum delay between retries
    },
    
    # Success rate thresholds for dynamic adjustment
    'success_rate_thresholds': {
        'high': 90,      # Above 90%: Can speed up
        'medium': 70,    # 70-90%: Keep current speed
        'low': 50        # Below 50%: Must slow down
    },
    
    # Adjustment factors
    'adjustment_factors': {
        'speed_up': 0.8,      # Reduce delay by 20%
        'slow_down': 1.5,     # Increase delay by 50%
        'min_interval': 1.0,  # Minimum 1 second between requests
        'max_interval': 10.0  # Maximum 10 seconds between requests
    },
    
    # League-specific adjustments
    'league_adjustments': {
        7: 1.0,   # NBA: Normal speed
        9: 1.2,   # NFL: 20% slower (more popular)
        8: 1.1,   # MLB: 10% slower
        10: 1.0   # NHL: Normal speed
    },
    
    # Request monitoring
    'monitoring': {
        'log_all_requests': True,
        'track_success_rates': True,
        'show_timing': True,
        'alert_on_failure_rate': 0.3  # Alert if 30%+ requests fail
    },
    
    # Block detection
    'block_detection': {
        'check_for_blocked_responses': True,
        'blocked_indicators': [
            'access denied',
            'rate limit exceeded',
            'too many requests',
            'blocked',
            'forbidden'
        ],
        'action_on_block': 'increase_delay',  # 'increase_delay' or 'stop_processing'
        'block_delay_multiplier': 3.0  # Triple the delay if blocked
    }
}

# Debug Configuration
DEBUG_CONFIG = {
    'verbose_logging': True,
    'show_request_details': True,
    'show_timing_breakdown': True,
    'log_failed_requests': True,
    'show_rate_limiting_info': True
}

# Performance Monitoring
PERFORMANCE_CONFIG = {
    'track_metrics': True,
    'log_performance_data': True,
    'performance_thresholds': {
        'max_request_time': 30,      # Max seconds per request
        'min_success_rate': 70,      # Minimum acceptable success rate
        'max_consecutive_failures': 5  # Max consecutive failures before alert
    }
}

def get_rate_limiting_config():
    """Get the current rate limiting configuration"""
    return RATE_LIMITING_CONFIG

def get_debug_config():
    """Get the current debug configuration"""
    return DEBUG_CONFIG

def get_performance_config():
    """Get the current performance monitoring configuration"""
    return PERFORMANCE_CONFIG

def update_rate_limiting_config(new_config):
    """Update the rate limiting configuration"""
    global RATE_LIMITING_CONFIG
    RATE_LIMITING_CONFIG.update(new_config)
    print("✅ Rate limiting configuration updated")

def print_current_config():
    """Print the current configuration"""
    print("\n📋 Current Rate Limiting Configuration:")
    print("=" * 50)
    
    config = get_rate_limiting_config()
    for category, settings in config.items():
        print(f"\n{category.upper()}:")
        for key, value in settings.items():
            print(f"  {key}: {value}")
    
    print("\n📋 Debug Configuration:")
    print("=" * 30)
    debug_config = get_debug_config()
    for key, value in debug_config.items():
        print(f"  {key}: {value}")
    
    print("\n📋 Performance Configuration:")
    print("=" * 30)
    perf_config = get_performance_config()
    for key, value in perf_config.items():
        print(f"  {key}: {value}")

if __name__ == "__main__":
    print_current_config()
