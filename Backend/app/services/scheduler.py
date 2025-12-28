from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.stocks import fetch_stock_data
from app.config import settings
from app.services.cache import cache
import asyncio
from datetime import datetime

scheduler = AsyncIOScheduler()

async def update_market_data():
    """
    Background task to fetch and cache market data for all tracked stocks.
    
    This function:
    1. Fetches data for all NSE symbols defined in settings.
    2. Forces an update to bypass existing cache.
    3. Caches the result for efficient retrieval by API endpoints.
    """
    print(f"[{datetime.now()}] Starting background market data update for {len(settings.ALL_NSE_SYMBOLS)} stocks...")
    try:
        # Fetch data for all symbols with force_update=True to ensure fresh data
        stocks = await fetch_stock_data(settings.ALL_NSE_SYMBOLS, include_chart=False, force_update=True)
        
        print(f"[{datetime.now()}] Market data update complete. Fetched {len(stocks)} stocks.")
        
    except Exception as e:
        print(f"[{datetime.now()}] Error in background update: {e}")

def start_scheduler():
    """
    Initialize and start the background scheduler.
    Sets up a recurring job to update market data every 60 seconds.
    """
    # Run immediately on startup by setting next_run_time=datetime.now()
    scheduler.add_job(update_market_data, 'interval', seconds=60, id='market_update', next_run_time=datetime.now())
    scheduler.start()
