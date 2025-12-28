from fastapi import APIRouter
from typing import List, Dict
import random
import yfinance as yf
from datetime import datetime

# Import Services
# from app.services.groww import groww_service # REMOVED
from app.services.stocks import get_cached_stocks

router = APIRouter(tags=["Advanced Analytics"])

# --- Helper: Lightweight Sentiment NLP ---
BULLISH_KEYWORDS = {
    "surge", "jump", "soar", "climb", "rise", "gain", "rally", "high", "record",
    "profit", "beat", "positive", "buy", "outperform", "bull", "growth", "win"
}
BEARISH_KEYWORDS = {
    "drop", "fall", "slide", "crash", "plunge", "loss", "miss", "negative",
    "sell", "down", "bear", "weak", "concern", "fear", "risk", "debt", "low"
}

def analyze_sentiment(text: str) -> Dict:
    text_lower = text.lower()
    score = 0.0
    
    # Simple keyword scoring
    words = text_lower.split()
    for word in words:
        clean_word = word.strip('.,?!')
        if clean_word in BULLISH_KEYWORDS:
            score += 1.0
        elif clean_word in BEARISH_KEYWORDS:
            score -= 1.0
            
    # Normalize score roughly between -1 and 1
    # Assuming a max of ~5 emotionally charged words per headline
    final_score = max(min(score / 3.0, 1.0), -1.0)
    
    label = "neutral"
    if final_score > 0.2: label = "bullish"
    elif final_score < -0.2: label = "bearish"
    
    return final_score, label

# --- Endpoints ---

@router.get("/advanced/options/{symbol}")
async def get_options_data(symbol: str):
    """
    Returns Options Data.
    Since Real-Time Option Chain API is expensive/restricted, we use a 
    High-Fidelity Simulation based on the REAL LIVE Spot Price.
    """
    # 1. Fetch Real Spot Price
    try:
        # Map nice names to Yahoo tickers
        y_symbol = "^NSEI" if symbol.upper() == "NIFTY" else \
                   "^NSEBANK" if symbol.upper() == "BANKNIFTY" else \
                   f"{symbol}.NS"
                   
        ticker = yf.Ticker(y_symbol)
        ticker._session = None # Prevent session reuse
        spot_price = ticker.fast_info.last_price
        del ticker
        if not spot_price:
             # Fallback if yfinance fails
             spot_price = 24000 if symbol == "NIFTY" else 1000
    except:
        spot_price = 24000 # Fallback default
        
    base_price = round(spot_price)
    strike_step = 50 if symbol == "NIFTY" else 100
    atm_strike = round(base_price / strike_step) * strike_step
    
    strikes = []
    
    # Generate realistic "Smirk" or "Smile" OI distribution
    # Usually Put OI is higher below ATM (Support)
    # Call OI is higher above ATM (Resistance)
    
    for i in range(-10, 11):
        strike = atm_strike + (i * strike_step)
        
        # Distance factor
        dist = abs(i)
        
        # Realistic OI Curve Simulation
        # Call OI peaks slightly OTM (e.g. +200 pts)
        call_bias = 1.0 if i > 0 else 0.4
        call_volatility = random.gauss(1.0, 0.1)
        call_oi = int(100000 * call_bias / (dist + 1) * call_volatility) + random.randint(1000, 5000)
        
        # Put OI peaks slightly OTM downside (e.g. -200 pts)
        put_bias = 1.0 if i < 0 else 0.4
        put_volatility = random.gauss(1.0, 0.1)
        put_oi = int(100000 * put_bias / (dist + 1) * put_volatility) + random.randint(1000, 5000)
        
        strikes.append({
            "strike": strike,
            "call_oi": abs(call_oi),
            "put_oi": abs(put_oi),
            "call_volume": abs(int(call_oi * 0.15)),
            "put_volume": abs(int(put_oi * 0.15))
        })
        
    total_call_oi = sum(s["call_oi"] for s in strikes)
    total_put_oi = sum(s["put_oi"] for s in strikes)
    pcr = round(total_put_oi / total_call_oi if total_call_oi > 0 else 1, 2)
    
    # Max Pain: Strike with minimum total money loss for writers
    # Simple approx: Strike with highest total OI is often a magnet, but real calculation is complex.
    # We'll use the "Highest Total OI" as a proxy for 'Support/Resistance' convergence.
    # Or just return ATM for simplicity.
    max_pain = atm_strike 

    return {
        "symbol": symbol,
        "spot_price": round(spot_price, 2),
        "pcr": pcr,
        "max_pain": max_pain,
        "atm_strike": atm_strike,
        "expiry": "NEXT-EXPIRY",
        "option_chain": strikes
    }

@router.get("/advanced/sentiment")
async def get_sentiment_analysis():
    """
    Real-Time Sentiment Analysis.
    (Mocked indefinitely since Groww Service is removed).
    """
    return {
        "market_sentiment_score": 50,
        "sentiment_label": "Neutral",
        "news_analysis": [],
        "trending_bullish": [],
        "trending_bearish": []
    }

@router.get("/advanced/heatmap")
def get_sector_heatmap():
    """
    Real-Time Sector Heatmap from Cached Stock Data.
    """
    stocks = list(get_cached_stocks()) # Force list to prevent lazy leaks
    
    sector_map = {}
    
    for stock in stocks:
        sector = stock.sector or "Others"
        if sector not in sector_map:
            sector_map[sector] = {"total_change": 0.0, "total_vol": 0, "count": 0, "best_stock": stock, "best_change": -999}
            
        data = sector_map[sector]
        data["total_change"] += stock.current_change
        data["total_vol"] += stock.volume
        data["count"] += 1
        
        if stock.current_change > data["best_change"]:
            data["best_change"] = stock.current_change
            data["best_stock"] = stock
            
    # Cleanup stocks list immediately
    del stocks
            
    # Format Response
    sectors = []
    for name, data in sector_map.items():
        avg_change = data["total_change"] / data["count"] if data["count"] > 0 else 0
        sectors.append({
            "name": name,
            "change": round(avg_change, 2),
            "volume": data["total_vol"],
            "top_stock": data["best_stock"].symbol
        })
    
    # Explicitly clear the map
    sector_map.clear()
        
    # Sort by Volume (Size)
    sectors.sort(key=lambda x: x['volume'], reverse=True)
    
    return {
        "timestamp": datetime.utcnow().isoformat(), # Smaller object
        "sectors": sectors
    }

@router.get("/advanced/indices")
async def get_market_indices():
    """
    Fetches Real-Time NIFTY 50 and SENSEX Data Sequentially (Memory Safe).
    """
    indices = [
        {"symbol": "^NSEI", "name": "NIFTY 50"},
        {"symbol": "^BSESN", "name": "SENSEX"},
        {"symbol": "^NSEBANK", "name": "BANK NIFTY"}
    ]
    
    results = []

    for idx in indices:
        try:
            ticker = yf.Ticker(idx["symbol"])
            ticker._session = None # Prevent session reuse
            
            # fast_info is reliable and fast
            last_price = ticker.fast_info.last_price
            prev_close = ticker.fast_info.previous_close
            
            # Explicit cleanup
            del ticker

            if not last_price:
                 results.append({
                    "name": idx["name"],
                    "value": "0.00",
                    "change": "0.00%",
                    "isPositive": True
                })
                 continue

            change = last_price - prev_close if last_price and prev_close else 0.0
            change_pct = (change / prev_close * 100) if prev_close else 0.0
            
            results.append({
                "name": idx["name"],
                "value": f"{last_price:,.2f}",
                "change": f"{change_pct:+.2f}%",
                "isPositive": change >= 0
            })
        except:
             results.append({
                "name": idx["name"],
                "value": "Error",
                "change": "0.00%",
                "isPositive": True
            })
    
    return results
