from fastapi import APIRouter, HTTPException, Body
from typing import List
from app.schemas import StockResponse, WatchlistAdd, WatchlistResponse
from app.services.stocks import get_stocks_by_symbols
from app.services.cache import cache

router = APIRouter(prefix="/watchlist", tags=["watchlist"])

# Simple in-memory watchlist for demo (per user session ideally, but global here)
WATCHLIST_KEY = "user_watchlist"

@router.get("/", response_model=List[StockResponse])
async def get_watchlist():
    symbols = cache.get(WATCHLIST_KEY) or []
    if not symbols:
        return []
        
    stocks = await get_stocks_by_symbols(symbols)
    return stocks

@router.post("/")
async def update_watchlist(item: WatchlistAdd):
    current_list = cache.get(WATCHLIST_KEY) or []
    
    if item.action == "add":
        if item.symbol not in current_list:
            current_list.append(item.symbol)
    elif item.action == "remove":
        if item.symbol in current_list:
            current_list.remove(item.symbol)
            
    # Persist in cache (long TTL for watchlist)
    cache.set(WATCHLIST_KEY, current_list, 3600 * 24) 
    
    return {"status": "success", "watchlist": current_list}
