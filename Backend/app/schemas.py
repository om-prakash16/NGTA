from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Stock Schemas ---

class ChartDataPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    macd: Optional[float] = None
    signal: Optional[float] = None
    hist: Optional[float] = None
    rsi: Optional[float] = None
    ema_20: Optional[float] = None
    ema_50: Optional[float] = None

class StockHistory(BaseModel):
    p_day1: float
    p_day2: float
    p_day3: float
    avg_3day: float
    volatility_3_day: float

class Indicators(BaseModel):
    macd_line: Optional[float] = None
    signal_line: Optional[float] = None
    macd_histogram: Optional[float] = None
    macd_status: str  # above, below, neutral
    rsi_value: Optional[float] = None
    rsi_zone: str  # overbought, oversold, neutral (Renamed from rsi_status)
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    ema_20: Optional[float] = None
    ema_50: Optional[float] = None
    trend: str
    buyer_strength_score: int
    seller_strength_score: int
    strength_label: str  # buyers, sellers, balanced

class StockFlags(BaseModel):
    is_constant_price: bool
    is_gainer_today: bool
    is_loser_today: bool
    is_high_volume: bool
    is_breakout_candidate: bool

class StockResponse(BaseModel):
    symbol: str
    name: str
    sector: str
    current_price: float
    previous_close: float
    current_change_abs: float
    current_change: float
    day_high: float
    day_low: float
    volume: int
    market_cap: Optional[float] = None
    last_updated: datetime
    rank: int
    
    history: StockHistory
    indicators: Indicators
    flags: StockFlags
    
    # Strength Fields
    current_strength: str
    day1_strength: str
    day2_strength: str
    day3_strength: str
    avg_3day_strength: str
    
    # Extended Details (Enriched)
    pe_ratio: Optional[float] = None
    industry_pe: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    dma_50: Optional[float] = None
    dma_200: Optional[float] = None
    dividend_yield: Optional[float] = None
    roe: Optional[float] = None
    roce: Optional[float] = None
    eps: Optional[float] = None
    book_value: Optional[float] = None
    pb_ratio: Optional[float] = None
    mtf_eligibility: Optional[bool] = None
    margin_pledge_pct: Optional[float] = None
    returns: Optional[Dict[str, float]] = None # {"1M": 5.2, "1Y": 12.5}
    
    derived: Optional[Dict[str, Any]] = None # Frontend compatibility (Badges)
    chart_data: List[ChartDataPoint] = []

class StockExtendedDetails(BaseModel):
    symbol: str
    fifty_two_week_high: float
    fifty_two_week_low: float
    beta: Optional[float] = None
    pe_ratio: Optional[float] = None
    eps: Optional[float] = None
    sector_pe: Optional[float] = None
    book_value: Optional[float] = None
    price_to_book: Optional[float] = None

class WatchlistAdd(BaseModel):
    symbol: str
    action: str

class WatchlistResponse(BaseModel):
    watchlist: List[str]

# --- Blog Schemas ---

class BlogPostBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    is_published: bool = True
    category: Optional[str] = None

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BlogPostBase):
    title: Optional[str] = None
    content: Optional[str] = None

class BlogPost(BlogPostBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime
    author_id: int

    class Config:
        from_attributes = True

# --- User Schemas ---

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    first_name: str
    last_name: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    
    class Config:
        from_attributes = True

# --- Auth Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
