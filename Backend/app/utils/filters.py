from typing import List, Optional
from app.schemas import StockResponse

def apply_filters(
    stocks: List[StockResponse],
    search: Optional[str] = None,
    sector: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_volume: Optional[int] = None,
    max_volume: Optional[int] = None,
    min_change_pct: Optional[float] = None,
    max_change_pct: Optional[float] = None,
    min_avg_3day_pct: Optional[float] = None,
    max_avg_3day_pct: Optional[float] = None,
    min_volatility: Optional[float] = None,
    max_volatility: Optional[float] = None,
    max_rank: Optional[int] = None,
    constant_only: bool = False,
    gainers_only: bool = False,
    losers_only: bool = False,
    high_volume_only: bool = False,
    macd_status: Optional[str] = None,
    rsi_zone: Optional[str] = None,
    strength: Optional[str] = None,
    p_day1_strength: Optional[str] = None,
    p_day2_strength: Optional[str] = None,
    p_day3_strength: Optional[str] = None,
    avg3_strength: Optional[str] = None,
    # New Strict Params
    today_str: Optional[str] = None,
    p1_str: Optional[str] = None,
    p2_str: Optional[str] = None,
    p3_str: Optional[str] = None,
    avg3_str: Optional[str] = None,
    min_avg3: Optional[float] = None,
    max_avg3: Optional[float] = None,
    sort_by: Optional[str] = None,
    sort_dir: str = "asc"
) -> List[StockResponse]:
    
    # Create a shallow copy to avoid modifying the cache in-place (if we were sorting in place, but we are building a new list)
    # Optimization: One-pass filtering
    
    # Pre-process comma-separated strings into sets for O(1) lookups
    macd_statuses = set(macd_status.split(',')) if macd_status else None
    rsi_zones = set(rsi_zone.split(',')) if rsi_zone else None
    strength_filters = set(strength.lower().split(',')) if strength else None
    
    d1_strengths = set(p_day1_strength.lower().split(',')) if p_day1_strength else None
    d2_strengths = set(p_day2_strength.lower().split(',')) if p_day2_strength else None
    d3_strengths = set(p_day3_strength.lower().split(',')) if p_day3_strength else None
    avg3_strengths = set(avg3_strength.lower().split(',')) if avg3_strength else None

    # Pre-process search term
    search_lower = search.lower() if search else None

    filtered = []
    
    for s in stocks:
        # 1. Search
        if search_lower:
            if search_lower not in s.symbol.lower() and (not s.name or search_lower not in s.name.lower()):
                continue
        
        # 2. Sector
        if sector and s.sector != sector:
            continue
            
        # 3. Price
        if min_price is not None and s.current_price < min_price:
            continue
        if max_price is not None and s.current_price > max_price:
            continue
            
        # 4. Volume
        if min_volume is not None and s.volume < min_volume:
            continue
        if max_volume is not None and s.volume > max_volume:
            continue
            
        # 5. Change %
        if min_change_pct is not None and s.current_change < min_change_pct:
            continue
        if max_change_pct is not None and s.current_change > max_change_pct:
            continue
            
        # 6. Avg 3-Day Change % (Mapped to new args too)
        # Support both min_avg_3day_pct (old) and min_avg3 (new)
        limit_min_avg = min_avg3 if min_avg3 is not None else min_avg_3day_pct
        limit_max_avg = max_avg3 if max_avg3 is not None else max_avg_3day_pct
        
        if limit_min_avg is not None and s.history.avg_3day < limit_min_avg:
            continue
        if limit_max_avg is not None and s.history.avg_3day > limit_max_avg:
            continue
            
        # 7. Volatility
        if min_volatility is not None and s.history.volatility_3_day < min_volatility:
            continue
        if max_volatility is not None and s.history.volatility_3_day > max_volatility:
            continue
            
        # 8. Rank
        if max_rank is not None and s.rank > max_rank:
            continue
            
        # 9. Flags
        if constant_only and not s.flags.is_constant_price:
            continue
        if gainers_only and not s.flags.is_gainer_today:
            continue
        if losers_only and not s.flags.is_loser_today:
            continue
        if high_volume_only and not s.flags.is_high_volume:
            continue
            
        # 10. Indicators
        if macd_statuses and s.indicators.macd_status not in macd_statuses:
            continue
            
        # RSI Zone - check both renamed field and potentially old usage
        # Schema has rsi_zone.
        if rsi_zones and s.indicators.rsi_zone not in rsi_zones:
            continue
            
        if strength_filters:
            # Note: strength_label might be "Buyers Dominating", we match "buyers"
            # Also support matching 'current_strength' field which is simpler
            # The schema has 'current_strength' which is just "Buyers", "Sellers", "Balanced" (from calculations.py)
            # But 'indicators.strength_label' is "Buyers Dominating" (from indicators.py - legacy?)
            # Let's check 'current_strength' as it is the standardized one
            if s.current_strength.lower() not in strength_filters:
                continue
        
        # 11. Specific Strengths (Legacy)
        if d1_strengths and s.day1_strength.lower() not in d1_strengths:
            continue
        if d2_strengths and s.day2_strength.lower() not in d2_strengths:
            continue
        if d3_strengths and s.day3_strength.lower() not in d3_strengths:
            continue
        if avg3_strengths and s.avg_3day_strength.lower() not in avg3_strengths:
            continue
            
        # 12. Strict UI Strength Filters (New Params)
        # Exact match logic (Case-insensitive)
        if today_str and s.current_strength.upper() != today_str.upper():
            continue
        if p1_str and s.day1_strength.upper() != p1_str.upper():
            continue
        if p2_str and s.day2_strength.upper() != p2_str.upper():
            continue
        if p3_str and s.day3_strength.upper() != p3_str.upper():
            continue
        if avg3_str and s.avg_3day_strength.upper() != avg3_str.upper():
            continue

        filtered.append(s)

    # 12. Sorting
    if sort_by:
        reverse = sort_dir == "desc"
        
        def get_sort_key(s: StockResponse):
            if sort_by == "rank": return s.rank
            if sort_by == "symbol": return s.symbol
            if sort_by == "price": return s.current_price
            if sort_by == "change": return s.current_change
            if sort_by == "volume": return s.volume
            if sort_by == "avg_3day": return s.history.avg_3day
            if sort_by == "volatility": return s.history.volatility_3_day
            if sort_by == "rsi": return s.indicators.rsi_value or 0
            if sort_by == "strength": return s.indicators.buyer_strength_score
            return s.rank
            
        filtered.sort(key=get_sort_key, reverse=reverse)
        
    return filtered
