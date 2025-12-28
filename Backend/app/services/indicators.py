import pandas as pd
import numpy as np
from typing import Tuple

def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(series: pd.Series) -> Tuple[pd.Series, pd.Series, pd.Series]:
    exp1 = series.ewm(span=12, adjust=False).mean()
    exp2 = series.ewm(span=26, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9, adjust=False).mean()
    histogram = macd - signal
    return macd, signal, histogram

def calculate_ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()

def calculate_sma(series: pd.Series, window: int) -> pd.Series:
    return series.rolling(window=window).mean()

def get_macd_status(macd: float, signal: float, hist: float) -> str:
    if macd > signal and macd > 0:
        return "above"
    elif macd < signal and macd < 0:
        return "below"
    else:
        return "neutral"

def get_rsi_status(rsi: float) -> str:
    if rsi >= 70:
        return "overbought"
    elif rsi <= 30:
        return "oversold"
    else:
        return "neutral"

def get_trend(price: float, ema20: float, ema50: float) -> str:
    if price > ema20 and ema20 > ema50:
        return "bullish"
    elif price < ema20 and ema20 < ema50:
        return "bearish"
    else:
        return "neutral"

def calculate_strength(
    macd_hist: float,
    rsi: float,
    volume: int,
    avg_volume: int,
    price: float,
    ema20: float,
    close: float,
    high: float,
    low: float
) -> Tuple[int, int, str]:
    
    buyer_score = 50
    seller_score = 50
    
    # MACD Contribution
    if macd_hist > 0:
        buyer_score += 10
        seller_score -= 10
    else:
        buyer_score -= 10
        seller_score += 10
        
    # RSI Contribution
    if rsi < 30:
        buyer_score += 15 # Oversold -> Buy signal
        seller_score -= 5
    elif rsi > 70:
        seller_score += 15 # Overbought -> Sell signal
        buyer_score -= 5
        
    # Trend Contribution
    if price > ema20:
        buyer_score += 10
        seller_score -= 5
    else:
        seller_score += 10
        buyer_score -= 5
        
    # Volume Contribution
    if volume > avg_volume * 1.5:
        # High volume confirms the move
        if price > close: # Green candle (approx)
            buyer_score += 5
        else:
            seller_score += 5

    # Clamp scores
    buyer_score = max(0, min(100, buyer_score))
    seller_score = max(0, min(100, seller_score))
        
    # Determine Label
    if buyer_score >= 60:
        label = "Buyers"
    elif seller_score >= 60:
        label = "Sellers"
    else:
        label = "Balanced"
    
    return buyer_score, seller_score, label
