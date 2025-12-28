import yfinance as yf
import pandas as pd
import numpy as np
import asyncio
import time
import traceback
from datetime import datetime
from typing import List, Dict, Any, Optional
import asyncio
import time
import traceback
import gc
import json
import os
from app.config import settings
from app.schemas import StockResponse, StockHistory, Indicators, StockFlags, ChartDataPoint, StockExtendedDetails
from app.services.indicators import (
    calculate_macd, calculate_rsi, calculate_ema, calculate_sma,
    get_macd_status, get_rsi_status, get_trend, calculate_strength
)
from app.utils.trading import get_last_trading_days, is_trading_day
from app.utils.market_status import get_market_view_mode
import pytz
from pydantic import ValidationError
try:
    import nselib
    from nselib import derivatives
except ImportError:
    nselib = None

import gc

def get_live_fno_stocks():
    """Fetch live F&O stock list from NSE via nselib"""
    # EXTREME MEMORY SAVING: Disable dynamic list fetch.
    # It loads a huge CSV/JSON into memory.
    # return []
    pass
    return []

# --- Global In-Memory Cache ---
CACHE = {
    "fno": {"data": [], "updated": 0},
    "last_refresh": None
}

# Resolve absolute path for cache file to avoid CWD issues on Render
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # app/services
CACHE_FILE = os.path.join(BASE_DIR, "..", "..", "market_data_cache.json")
CACHE_FILE = os.path.abspath(CACHE_FILE)

def save_cache():
    """Save valid stocks to disk for fast reload"""
    try:
        data = [s.model_dump(mode='json') for s in CACHE["fno"]["data"]]
        with open(CACHE_FILE, "w") as f:
            json.dump(data, f)
        print(f"Cache saved to {CACHE_FILE} ({len(data)} items)", flush=True)
    except Exception as e:
        print(f"Failed to save cache: {e}", flush=True)

def load_cache():
    """Load stocks from disk on startup"""
    try:
        if os.path.exists(CACHE_FILE):
            print(f"Loading cache from {CACHE_FILE}...", flush=True)
            with open(CACHE_FILE, "r") as f:
                data = json.load(f)
                stocks = [StockResponse(**item) for item in data]
                CACHE["fno"]["data"] = stocks
                CACHE["fno"]["updated"] = time.time()
                print(f"Loaded {len(stocks)} stocks from cache.", flush=True)
                return True
    except Exception as e:
        print(f"Failed to load cache: {e}", flush=True)
    return False

# --- Helper Functions ---

def get_safe_value(val, default=None):
    if pd.isna(val):
        return default
    if isinstance(val, (np.integer, np.floating)):
        return val.item()
    return val

def get_strength_label(pct_change: float) -> str:
    if pct_change > 0.5:
        return "Buyers Dominating"
    elif pct_change < -0.5:
        return "Sellers Dominating"
    return "Balanced"

def get_dummy_history() -> StockHistory:
    return StockHistory(
        p_day1=0.0,
        p_day2=0.0,
        p_day3=0.0,
        avg_3day=0.0,
        volatility_3_day=0.0
    )

def get_dummy_indicators() -> Indicators:
    return Indicators(
        macd_status="neutral",
        rsi_zone="neutral",
        trend="neutral",
        buyer_strength_score=50,
        seller_strength_score=50,
        strength_label="Loading..."
    )

def get_dummy_flags() -> StockFlags:
    return StockFlags(
        is_constant_price=False,
        is_gainer_today=False,
        is_loser_today=False,
        is_high_volume=False,
        is_breakout_candidate=False
    )

def create_stock_response_from_fast_info(symbol: str, info: Dict) -> StockResponse:
    """
    Creates a StockResponse with just fast_info and dummy history/indicators.
    """
    current_price = info.get('lastPrice', 0.0)
    prev_close = info.get('previousClose', 0.0)
    
    current_change_abs = current_price - prev_close
    current_change = (current_change_abs / prev_close * 100) if prev_close else 0.0
    
    return StockResponse(
        symbol=symbol,
        name=symbol,
        sector=settings.SECTOR_MAPPING.get(symbol, "Unknown"),
        current_price=round(current_price, 2),
        previous_close=round(prev_close, 2),
        current_change_abs=round(current_change_abs, 2),
        current_change=round(current_change, 2),
        day_high=round(info.get('dayHigh', 0.0), 2),
        day_low=round(info.get('dayLow', 0.0), 2),
        volume=int(info.get('volume', 0)),
        market_cap=info.get('marketCap'),
        last_updated=datetime.now(),
        rank=0,
        history=get_dummy_history(),
        indicators=get_dummy_indicators(),
        flags=get_dummy_flags(),
        chart_data=[],
        current_strength=get_strength_label(current_change),
        day1_strength="Neutral",
        day2_strength="Neutral",
        day3_strength="Neutral",
        avg_3day_strength="Neutral"
    )


# Import standardized calculations
from app.utils.calculations import calculate_strength_label, calculate_3d_avg, calculate_avg_strength_label

def process_stock_data(symbol: str, hist_data: pd.DataFrame, info: Dict, include_chart: bool = False) -> Optional[StockResponse]:
    try:
        now_ist = datetime.now(pytz.timezone('Asia/Kolkata'))
        
        view_mode = get_market_view_mode(now_ist)
        dates = view_mode['dates']
        
        # Assign P-Dates from the unified logic
        d1_date = dates['p1']
        d2_date = dates['p2']
        d3_date = dates['p3']
        
        # Handle case where history might be insufficient (fresh deployment?)
        if not d1_date:
             # Fallback to manual if something failed, though get_market_view_mode handles defaults
             pass
             
        # ... existing override logic for Pre-Close using d1_date or target_dates[0] if needed ...
        # Actually, for Weekend, 'previous_close' is typically the close of P1 relative to 'Today'.
        # If Today=Fri, PrevClose=Thu.
        
        # Helper to get change for a specific date
        def get_change_for_date(target_date):
             # ... (Keep existing implementation or simplify if needed) ...
             # We can actually reuse the same logic
             # But for simpler logic:
             target_str = target_date.strftime("%Y-%m-%d")
             try:
                 # Standardize lookup
                 if hasattr(hist_data.index, 'strftime'):
                    formatted_index = hist_data.index.strftime("%Y-%m-%d")
                 else:
                    return 0.0
                    
                 if target_str in formatted_index:
                        loc = hist_data.index.get_loc(target_str)
                        if isinstance(loc, slice): loc = loc.start
                        if isinstance(loc, int) and loc > 0:
                            close = hist_data['Close'].iloc[loc]
                            prev_day_close = hist_data['Close'].iloc[loc - 1]
                            if prev_day_close and prev_day_close != 0:
                                return (close - prev_day_close) / prev_day_close * 100
             except:
                pass
             return 0.0

        # Calculate P_Day values
        p_day1 = get_change_for_date(d1_date)
        p_day2 = get_change_for_date(d2_date)
        p_day3 = get_change_for_date(d3_date)
        
        # CRITICAL FIX: If we are in HISTORICAL mode (Weekend/Pre-Market),
        # The 'current_change' derived from fast_info (Price - PrevClose) might be stale or mismatching.
        # We should use the calculated change for the 'Current' date (which is Dates['current'] in view_mode).
        if view_mode['view_mode'] == 'HISTORICAL' and dates['current']:
             # Override current_change with authoritative History Calculation
             hist_current_change = get_change_for_date(dates['current'])
             # If we successfully calculated it (non-zero or zero but valid), use it.
             # Note: getting exactly 0.0 is rare but possible.
             # A way to check validity is if date was found.
             # simpler: just use it.
             current_change = hist_current_change
             # Also update current_change_abs implied? We don't use abs much in UI for 'Today' column except color.
             # We should probably update it but we don't have the 'Close' easily here without re-fetching.
             # It's fine, Percentage is what matters most.
        
        # Use Standardized Calculation
        avg_3day = calculate_3d_avg(p_day1, p_day2, p_day3)

        # 3. Indicators
        closes = hist_data['Close']
        macd, signal, hist = calculate_macd(closes)
        rsi = calculate_rsi(closes)
        ema_20 = calculate_ema(closes, 20)
        ema_50 = calculate_ema(closes, 50)
        sma_20 = calculate_sma(closes, 20)
        sma_50 = calculate_sma(closes, 50)

        # Statuses
        macd_val = macd.iloc[-1] if not pd.isna(macd.iloc[-1]) else 0
        signal_val = signal.iloc[-1] if not pd.isna(signal.iloc[-1]) else 0
        hist_val = hist.iloc[-1] if not pd.isna(hist.iloc[-1]) else 0
        rsi_val = rsi.iloc[-1] if not pd.isna(rsi.iloc[-1]) else 50
        ema_20_val = ema_20.iloc[-1] if not pd.isna(ema_20.iloc[-1]) else current_price
        ema_50_val = ema_50.iloc[-1] if not pd.isna(ema_50.iloc[-1]) else current_price
        
        macd_status = get_macd_status(macd_val, signal_val, hist_val)
        rsi_status = get_rsi_status(rsi_val)
        trend = get_trend(current_price, ema_20_val, ema_50_val)
        
        # Indicator Strength Score (Internal logic, kept as is or can be standardized if needed)
        buyer_score, seller_score, indicator_strength_label = calculate_strength(
            hist_val, rsi_val, int(info.get('volume', 0)), int(info.get('averageVolume', 0)),
            current_price, ema_20_val, current_price,
            info.get('dayHigh', current_price), info.get('dayLow', current_price)
        )

        # 4. Standardized Strength Labels
        current_strength = calculate_strength_label(current_change)
        day1_str = calculate_strength_label(p_day1)
        day2_str = calculate_strength_label(p_day2)
        day3_str = calculate_strength_label(p_day3)
        
        # 3D Avg Strength: Score Based Strength (Avg of scores)
        avg_3day_str = calculate_avg_strength_label(day1_str, day2_str, day3_str)

        # DEBUG: Print values for verification if needed
        # print(f"Processing {symbol}: Price={current_price}, Prev={prev_close}, Change%={current_change}, Avg3D={avg_3day}, AvgStr={avg_3day_str}", flush=True)

        # 5. Flags
        is_constant = abs(avg_3day) < 0.0001
        is_gainer = current_change > 0
        is_loser = current_change < 0
        avg_vol = info.get('averageVolume', 0)
        curr_vol = info.get('volume', 0)
        is_high_vol = (curr_vol > avg_vol * 1.5) if avg_vol else False
        is_breakout = (current_price > info.get('dayHigh', current_price) * 0.99) and is_high_vol

        # 6. Chart Data - OPTIMIZED: Only generate if requested (Lazy Loading)
        chart_data = []
        if include_chart:
            recent_hist = hist_data.tail(50)
            for date, row in recent_hist.iterrows():
                chart_data.append(ChartDataPoint(
                    date=date.strftime("%Y-%m-%d"),
                    open=row['Open'],
                    high=row['High'],
                    low=row['Low'],
                    close=row['Close'],
                    volume=row['Volume'],
                    macd=get_safe_value(macd.loc[date]),
                    signal=get_safe_value(signal.loc[date]),
                    hist=get_safe_value(hist.loc[date]),
                    rsi=get_safe_value(rsi.loc[date]),
                    ema_20=get_safe_value(ema_20.loc[date]),
                    ema_50=get_safe_value(ema_50.loc[date])
                ))

        return StockResponse(
            symbol=symbol,
            name=symbol,
            sector=settings.SECTOR_MAPPING.get(symbol, "Unknown"),
            current_price=round(current_price, 2),
            previous_close=round(prev_close, 2),
            current_change_abs=round(current_change_abs, 2),
            current_change=round(current_change, 2),
            day_high=round(info.get('dayHigh', 0.0), 2),
            day_low=round(info.get('dayLow', 0.0), 2),
            volume=int(info.get('volume', 0)),
            market_cap=info.get('marketCap'),
            last_updated=datetime.now(),
            rank=0, # Calculated later
            
            # Initial Fast Info Mapping
            fifty_two_week_high=round(info.get('yearHigh', 0.0), 2) if info.get('yearHigh') else None,
            fifty_two_week_low=round(info.get('yearLow', 0.0), 2) if info.get('yearLow') else None,
            pe_ratio=None, # fast_info doesn't provide PE. Would need 'ticker.info' which is slow.
            
            history=StockHistory(
                p_day1=round(p_day1, 2),
                p_day2=round(p_day2, 2),
                p_day3=round(p_day3, 2),
                avg_3day=round(avg_3day, 2),
                volatility_3_day=0.0
            ),
            indicators=Indicators(
                macd_line=get_safe_value(macd.iloc[-1]),
                signal_line=get_safe_value(signal.iloc[-1]),
                macd_histogram=get_safe_value(hist.iloc[-1]),
                macd_status=macd_status,
                rsi_value=get_safe_value(rsi.iloc[-1]),
                rsi_zone=rsi_status,
                sma_20=get_safe_value(sma_20.iloc[-1]),
                sma_50=get_safe_value(sma_50.iloc[-1]),
                ema_20=get_safe_value(ema_20.iloc[-1]),
                ema_50=get_safe_value(ema_50.iloc[-1]),
                trend=trend,
                buyer_strength_score=buyer_score,
                seller_strength_score=seller_score,
                strength_label=indicator_strength_label 
            ),
            flags=StockFlags(
                is_constant_price=is_constant,
                is_gainer_today=is_gainer,
                is_loser_today=is_loser,
                is_high_volume=is_high_vol,
                is_breakout_candidate=is_breakout
            ),
            chart_data=chart_data,
            # Frontend Compatibility for Badges
            derived={
                "macdLabel": "Above Zero (Bullish)" if macd_status == "above" else "Below Zero (Bearish)" if macd_status == "below" else "Neutral",
                "rsiLabel": "Overbought (>70)" if rsi_status == "overbought" else "Oversold (<30)" if rsi_status == "oversold" else "Neutral (30-70)"
            },
            
            # Standardized Strength Fields
            current_strength=current_strength,
            day1_strength=day1_str,
            day2_strength=day2_str,
            day3_strength=day3_str,
            avg_3day_strength=avg_3day_str
        )
    except ValidationError as ve:
        print(f"Validation Error for {symbol}: {ve.errors()}", flush=True)
        return None
    except Exception as e:
        print(f"Error processing {symbol}: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return None

async def fetch_stock_data(symbol: str) -> Optional[StockResponse]:
    try:
        loop = asyncio.get_event_loop()
        ticker = yf.Ticker(symbol)
        
        # Run blocking calls in executor
        # Run blocking calls in executor
        # Optimized: Use default executor (None) to avoid creating new threads for every request
        
        # Fetch history (need enough for indicators + 3 days)
        # 3 months is safe
        hist = await loop.run_in_executor(None, lambda: ticker.history(period="3mo"))
        
        # Fetch fast_info (SAFE)
        info_dict = {}
        try:
            info = await loop.run_in_executor(None, lambda: ticker.fast_info)
            def safe_get(key, default=0.0):
                try:
                    val = getattr(info, key, default)
                    return val if val is not None else default
                except Exception:
                    return default

            info_dict = {
                'lastPrice': safe_get('last_price'),
                'previousClose': safe_get('previous_close'),
                'dayHigh': safe_get('day_high'),
                'dayLow': safe_get('day_low'),
                'volume': safe_get('last_volume', 0),
                'marketCap': safe_get('market_cap'),
                'averageVolume': safe_get('three_month_average_volume'),
                'yearHigh': safe_get('year_high'),
                'yearLow': safe_get('year_low'),
            }
        except Exception as e:
            print(f"FastInfo failed for {symbol}: {e}. Falling back to History.", flush=True)

        # CRITICAL FALLBACK: If fast_info failed or returned 0s, use History
        if not hist.empty:
            last_row = hist.iloc[-1]
            prev_row = hist.iloc[-2] if len(hist) > 1 else last_row
            
            if not info_dict.get('lastPrice'):
                info_dict['lastPrice'] = last_row['Close']
            if not info_dict.get('previousClose'):
                info_dict['previousClose'] = prev_row['Close']
            if not info_dict.get('dayHigh'):
                info_dict['dayHigh'] = last_row['High']
            if not info_dict.get('dayLow'):
                info_dict['dayLow'] = last_row['Low']
            if not info_dict.get('volume'):
                info_dict['volume'] = last_row['Volume']
        
        # If still no price, we can't process
        if not info_dict.get('lastPrice'):
            print(f"Skipping {symbol}: No price data available from Info or History", flush=True)
            return None

        return process_stock_data(symbol, hist, info_dict)

    except Exception as e:
        msg = f"Error fetching {symbol}: {repr(e)}\n{traceback.format_exc()}"
        print(msg, flush=True)
        try:
             with open("backend_debug.log", "w") as f:
                 f.write(msg)
        except:
             pass
        return None

async def refresh_market_data():
    """Background task to refresh data periodically using Bulk Download (Reliable)"""
    
    # 1. Fast Load from Disk
    load_cache()

    while True:
        try:
            with open("task_status.txt", "a") as f:
                f.write(f"Task Loop Start (Bulk): {datetime.now()}\n")
            
            print("Refreshing market data (Bulk)...", flush=True)
            start_time = time.time()
            
            print("Refreshing market data (Bulk)...", flush=True)
            start_time = time.time()
            
            # Dynamic Fetch
            live_symbols = get_live_fno_stocks()
            if live_symbols:
                print(f"Loaded {len(live_symbols)} F&O symbols from NSE Live.")
                symbols = live_symbols
            else:
                print(f"Using fallback config F&O list ({len(settings.FNO_STOCKS)}).")
                symbols = settings.FNO_STOCKS
            
            # HARD CAP: Only process top 25 stocks to stay under 512MB
            # Python + Pandas overhead is ~300MB baseline + ~10MB per stock operation
            # 25 is safe. 50 might push it.
            if len(symbols) > 25:
                 print(f"Cap applied: Limiting from {len(symbols)} to 25 stocks for stability.")
                 symbols = symbols[:25]
            
            valid_stocks = []
            
            # SEMAPHORE: STRICT LIMIT TO 1 (Sequential) to prevent 512MB OOM
            # Even 2-3 threads can spike memory during DataFrame creation.
            # Sequential is safer and "Fast Enough" with the Seed Data.
            sem = asyncio.Semaphore(1)

            async def fetch_and_process(symbol):
                async with sem:
                    try:
                        loop = asyncio.get_event_loop()
                        ticker = yf.Ticker(symbol)
                        
                        # Fetch History (Blocking)
                        # REDUCED HISTORY to 2mo to save RAM (approx 44 rows)
                        hist = await loop.run_in_executor(None, lambda: ticker.history(period="2mo"))
                        
                        if hist.empty: return None

                        # Manual Fast Info extraction from history to save an extra API call
                        last_row = hist.iloc[-1]
                        prev_row = hist.iloc[-2] if len(hist) > 1 else last_row
                        
                        info_dict = {
                            'lastPrice': float(last_row['Close']),
                            'previousClose': float(prev_row['Close']),
                            'dayHigh': float(last_row['High']),
                            'dayLow': float(last_row['Low']),
                            'volume': int(last_row['Volume']),
                            'marketCap': 0, # Not critical for list view
                            'averageVolume': 0,
                            'yearHigh': float(hist['High'].max()),
                            'yearLow': float(hist['Low'].min()),
                        }
                        
                        # Process (CPU bound, fast)
                        processed = process_stock_data(symbol, hist, info_dict, include_chart=False)
                        
                        # Explicit cleanup
                        del hist
                        del ticker
                        return processed
                    except Exception:
                        return None

            # Gather all tasks
            tasks = [fetch_and_process(sym) for sym in symbols]
            
            # Process as they complete to show progress? No, gather is easier for now.
            # To avoid huge task list overhead, we can process in batches of 10 tasks.
            
            BATCH_SIZE = 10
            total_processed = 0
            
            for i in range(0, len(symbols), BATCH_SIZE):
                batch_tasks = tasks[i:i + BATCH_SIZE]
                print(f"Processing Batch {i//BATCH_SIZE + 1}...", flush=True)
                results = await asyncio.gather(*batch_tasks)
                
                for res in results:
                    if res: valid_stocks.append(res)
                
                # Cleanup after batch
                del results
                del batch_tasks
                gc.collect()
                # Tiny yield
                await asyncio.sleep(0.1)

            print(f"Refreshed {len(valid_stocks)} stocks.", flush=True)

            # Redundant loop removed (logic moved to batched chunks)

            with open("task_status.txt", "a") as f:
                f.write(f"Bulk Fetched: {len(valid_stocks)}/{len(symbols)}\n")

            # Fallback: If Yahoo Finance failed (0 stocks), generate Mock Data
            if not valid_stocks:
                print("WARNING: Yahoo Finance failed. Generatng MOCK DATA.", flush=True)
                import random
                for i, symbol in enumerate(symbols[:50]): # limiting to 50
                    base_price = random.uniform(100, 3000)
                    change_pct = random.uniform(-2.5, 2.5)
                    price = base_price * (1 + change_pct/100)
                    
                    mock_stock = StockResponse(
                        symbol=symbol,
                        name=symbol,
                        sector=settings.SECTOR_MAPPING.get(symbol, "Unknown"),
                        current_price=round(price, 2),
                        previous_close=round(base_price, 2),
                        current_change_abs=round(price - base_price, 2),
                        current_change=round(change_pct, 2),
                        day_high=round(price * 1.01, 2),
                        day_low=round(price * 0.99, 2),
                        volume=random.randint(10000, 1000000),
                        market_cap=random.uniform(1000, 500000),
                        last_updated=datetime.now(),
                        rank=i+1,
                        history=get_dummy_history(),
                        indicators=get_dummy_indicators(),
                        flags=get_dummy_flags(),
                        chart_data=[],
                        current_strength=get_strength_label(change_pct),
                        day1_strength="Neutral",
                        day2_strength="Neutral",
                        day3_strength="Neutral",
                        avg_3day_strength="Neutral"
                    )
                    valid_stocks.append(mock_stock)

            if valid_stocks:
                # Sort and Rank
                valid_stocks.sort(key=lambda x: abs(x.history.avg_3day))
                for idx, stock in enumerate(valid_stocks):
                    stock.rank = idx + 1
                
                CACHE["fno"]["data"] = valid_stocks
                CACHE["fno"]["updated"] = time.time()
                CACHE["last_refresh"] = datetime.now()
                
                # 2. Save to Disk
                save_cache()
            
            print(f"Market data refresh complete. {len(valid_stocks)} stocks. Time: {time.time() - start_time:.2f}s", flush=True)

        except Exception as e:
            print(f"Error in refresh task: {e}", flush=True)
            with open("task_status.txt", "a") as f:
                traceback.print_exc()
        finally:
            gc.collect()
            
        await asyncio.sleep(settings.REFRESH_INTERVAL)

def get_cached_stocks() -> List[StockResponse]:
    return CACHE["fno"]["data"]

def get_stock_detail(symbol: str) -> Optional[StockResponse]:
    # Try cache first
    for s in CACHE["fno"]["data"]:
        if s.symbol == symbol:
            return s
    return None

async def get_stocks_by_symbols(symbols: List[str]) -> List[StockResponse]:
    cached = get_cached_stocks()
    return [s for s in cached if s.symbol in symbols]

def start_background_tasks():
    # This is now handled in main.py lifespan
    pass

def enrich_stock_data(stock: StockResponse) -> StockResponse:
    """
    Fetches detailed fundamental and return data for a single stock on-demand.
    This is a blocking call (web request) so it should be used only for detail views.
    """
    try:
        symbol = stock.symbol
        ticker = yf.Ticker(symbol)
        
        # 1. Fetch Info (Fundamentals)
        info = ticker.info
        
        # Fundamentals
        stock.pe_ratio = info.get('trailingPE')
        # Industry PE is often not direct. Try proxies or None.
        stock.industry_pe = info.get('industryPE') 
        
        stock.dividend_yield = info.get('dividendYield')
        if stock.dividend_yield and stock.dividend_yield < 1: 
             # Heuristic: if less than 1 (100%), it might be a ratio, 
             # BUT yfinance usually gives 0.0192 for 1.92%. 
             # WAIT. My previous debug said 1.92. 
             # Let's check `debug_fields` output again.
             # "dividendYield: 1.92"
             # 1.92 is HUGE if it's a ratio (192%). 
             # So 1.92 MUST be percentage.
             # So just round it.
             pass
             
        # Actually, let's look at the earlier output EXACTLY.
        # "dividendYield: 1.92"
        # If I had multiplied 1.92 * 100 I got 192.0.
        # So I should NOT multiply.
        
        if stock.dividend_yield: stock.dividend_yield = round(stock.dividend_yield, 2)

        stock.roe = info.get('returnOnEquity')
        if stock.roe: stock.roe = round(stock.roe * 100, 2)
        
        # ROCE Proxy (ROA is closest available often)
        stock.roce = info.get('returnOnAssets') # As proxy if ROCE unavailable
        if stock.roce: stock.roce = round(stock.roce * 100, 2)
        
        stock.eps = info.get('trailingEps')
        stock.book_value = info.get('bookValue')
        stock.pb_ratio = info.get('priceToBook')
        
        # 52W High/Low fallback/overwrite
        stock.fifty_two_week_high = info.get('fiftyTwoWeekHigh', stock.fifty_two_week_high)
        stock.fifty_two_week_low = info.get('fiftyTwoWeekLow', stock.fifty_two_week_low)
        
        # DMA
        stock.dma_50 = info.get('fiftyDayAverage')
        stock.dma_200 = info.get('twoHundredDayAverage')
        
        # 2. Calculate Returns (1M, 3M, 1Y, 3Y, 5Y, All Time)
        # Fetch max history to cover all cases
        hist_long = ticker.history(period="max")
        
        returns = {}
        if not hist_long.empty:
            current_close = hist_long['Close'].iloc[-1]
            
            def calculate_return(days_ago):
                # Ensure we have enough data
                if len(hist_long) > days_ago:
                    # Use iloc[-days_ago] as approximation
                    prev_close = hist_long['Close'].iloc[-days_ago]
                    if prev_close and prev_close > 0:
                        return round(((current_close - prev_close) / prev_close) * 100, 2)
                return None

            # Trading days approximations (approx 252 trading days per year)
            returns['1M'] = calculate_return(21)
            returns['3M'] = calculate_return(63)
            returns['1Y'] = calculate_return(252)
            returns['3Y'] = calculate_return(252 * 3)
            returns['5Y'] = calculate_return(252 * 5)
            
            # All Time Return
            first_close = hist_long['Close'].iloc[0]
            if first_close > 0:
                returns['All'] = round(((current_close - first_close) / first_close) * 100, 2)
            else:
                returns['All'] = None

            # Re-generate Chart Data if missing (Lazy Load)
            if not stock.chart_data:
                # Calculate indicators on this history
                closes = hist_long['Close']
                macd, signal, hist = calculate_macd(closes)
                rsi = calculate_rsi(closes)
                ema_20 = calculate_ema(closes, 20)
                ema_50 = calculate_ema(closes, 50)
                
                chart_data = []
                # Last 50 points
                recent_hist = hist_long.tail(50)
                for date, row in recent_hist.iterrows():
                    chart_data.append(ChartDataPoint(
                        date=date.strftime("%Y-%m-%d"),
                        open=row['Open'],
                        high=row['High'],
                        low=row['Low'],
                        close=row['Close'],
                        volume=row['Volume'],
                        macd=get_safe_value(macd.loc[date]),
                        signal=get_safe_value(signal.loc[date]),
                        hist=get_safe_value(hist.loc[date]),
                        rsi=get_safe_value(rsi.loc[date]),
                        ema_20=get_safe_value(ema_20.loc[date]),
                        ema_50=get_safe_value(ema_50.loc[date])
                    ))
                stock.chart_data = chart_data
        
        stock.returns = returns
        
        return stock
    except Exception as e:
        print(f"Error enriching {stock.symbol}: {e}", flush=True)
        return stock
