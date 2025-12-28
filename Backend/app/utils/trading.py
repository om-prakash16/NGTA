from datetime import datetime, timedelta
from typing import List

# NSE Holidays 2024-2025 (Partial/Example list - needs to be kept updated)
NSE_HOLIDAYS = {
    # 2024
    "2024-01-22", "2024-01-26", "2024-03-08", "2024-03-25", "2024-03-29",
    "2024-04-11", "2024-04-17", "2024-05-01", "2024-05-20", "2024-06-17",
    "2024-07-17", "2024-08-15", "2024-10-02", "2024-11-01", "2024-11-15",
    "2024-12-25",
    # 2025 (Projected/Common holidays)
    "2025-01-26", "2025-03-14", "2025-03-31", "2025-04-10", "2025-04-14",
    "2025-05-01", "2025-08-15", "2025-10-02", "2025-10-21", "2025-12-25"
}

def is_trading_day(date: datetime) -> bool:
    """Check if a date is a valid trading day (Mon-Fri and not a holiday)."""
    if date.weekday() >= 5:  # Saturday=5, Sunday=6
        return False
    
    date_str = date.strftime("%Y-%m-%d")
    if date_str in NSE_HOLIDAYS:
        return False
        
    return True

def get_last_trading_days(n: int = 3) -> List[datetime]:
    """
    Get the last n valid trading days relative to today.
    If today is a trading day and market is open/closed, it counts as one ONLY if data is available.
    However, for 'Past' days (P Day 1, 2, 3), we usually look backwards from *yesterday* 
    or from *today* depending on when the script runs.
    
    Assumption: We want the last 3 *completed* or *active* trading days excluding today if we are calculating 'Previous' days.
    But the requirement says:
    P Day 1 = previous trading day
    P Day 2 = day before that
    P Day 3 = day before that
    
    So we start checking from yesterday backwards.
    """
    days = []
    current_date = datetime.now()
    
    # Start checking from yesterday to find P Day 1, 2, 3
    check_date = current_date - timedelta(days=1)
    
    while len(days) < n:
        if is_trading_day(check_date):
            days.append(check_date)
        check_date -= timedelta(days=1)
        
    return days
