"""
Utility helper functions
"""

import uuid
from datetime import datetime
import pytz


def get_nairobi_time():
    """Get current time in Nairobi timezone"""
    nairobi_timezone = pytz.timezone('Africa/Nairobi')
    current_time_nairobi = datetime.now(nairobi_timezone)
    
    curr_day = current_time_nairobi.strftime('%A')
    curr_date = current_time_nairobi.strftime('%Y-%m-%d')
    curr_time = current_time_nairobi.strftime('%H:%M:%S')
    
    full_date = f"{curr_day} | {curr_date} | {curr_time}"
    return full_date, curr_time


def generate_request_id() -> str:
    """Generate a unique request ID"""
    return str(uuid.uuid4())
