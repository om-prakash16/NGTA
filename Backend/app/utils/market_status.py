from datetime import datetime, time
import pytz
from app.utils.trading import is_trading_day, get_last_trading_days

IST = pytz.timezone('Asia/Kolkata')

MARKET_START = time(9, 15)
MARKET_END = time(15, 30)

def get_current_ist_time() -> datetime:
    return datetime.now(IST)

def get_market_view_mode(now: datetime) -> dict:
    """
    Returns strict view dates based on market rules.
    """
    current_time = now.time()
    is_active_day = is_trading_day(now)
    
    # Defaults
    status = "CLOSED_HOLIDAY"
    message = "Market is closed."
    view_mode = "HISTORICAL" # Default to showing last closed days
    
    if is_active_day:
        if current_time < MARKET_START:
            status = "CLOSED_PRE_MARKET"
            message = "Market has not opened yet."
            view_mode = "HISTORICAL"  # Show standard history (Today = Last Close)
        elif current_time > MARKET_END:
            status = "CLOSED_POST_MARKET"
            message = "Market is closed for the day."
            view_mode = "LIVE"        # Show Today's data as Final
        else:
            status = "OPEN"
            message = "Market is Live."
            view_mode = "LIVE"        # Show Today's data
            
    # Calculate Dates
    # If LIVE: Today is the Primary, P1 is Last Traded (Yesterday)
    # If HISTORICAL: Today is Last Traded (Yesterday/Friday), P1 is Day Before
    
    if view_mode == "LIVE":
        # Today is active
        # We need P1, P2, P3 from history
        history_days = get_last_trading_days(3) # [Yest, DayBefore, ...]
        
        dates = {
            "current": now,
            "p1": history_days[0] if len(history_days) > 0 else None,
            "p2": history_days[1] if len(history_days) > 1 else None,
            "p3": history_days[2] if len(history_days) > 2 else None,
        }
    else:
        # PRE_MARKET or WEEKEND
        # Today's column shows the LAST COMPLETED trading day
        history_days = get_last_trading_days(4) # [Fri, Thu, Wed, Tue]
        
        dates = {
            "current": history_days[0] if len(history_days) > 0 else None,
            "p1": history_days[1] if len(history_days) > 1 else None,
            "p2": history_days[2] if len(history_days) > 2 else None,
            "p3": history_days[3] if len(history_days) > 3 else None,
        }

    return {
        "status": status,
        "message": message,
        "view_mode": view_mode,
        "dates": dates
    }

def get_market_status() -> dict:
    now = get_current_ist_time()
    view = get_market_view_mode(now)
    
    dates = view["dates"]
    headers = {}
    
    # Format Headers (e.g. "Fri, 05 Dec")
    def fmt(d):
        return d.strftime("%a, %d %b") if d else "-"
        
    headers["current"] = fmt(dates["current"])
    headers["p1"] = fmt(dates["p1"])
    headers["p2"] = fmt(dates["p2"])
    headers["p3"] = fmt(dates["p3"])
    
    # Override "current" text for special cases if desired, 
    # but User requested "Start Date to Friday", so strict dates are better.
    # We can append "(Today)" if Live.
    if view["view_mode"] == "LIVE" and dates["current"]:
         headers["current"] = f"Today ({dates['current'].strftime('%a')})"

    return {
        "status": view["status"],
        "current_time": now.isoformat(),
        "message": view["message"],
        "headers": headers
    }
