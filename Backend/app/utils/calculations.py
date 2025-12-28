from typing import Tuple

def calculate_strength_label(pct_change: float) -> str:
    """
    Map % change to strength label.
    Rules:
    - pct > 0.20  -> "Buyers"
    - pct < -0.20 -> "Sellers"
    - else        -> "Balanced"
    """
    if pct_change > 0.20:
        return "Buyers"
    elif pct_change < -0.20:
        return "Sellers"
    return "Balanced"

def calculate_3d_avg(p1: float, p2: float, p3: float) -> float:
    """
    Calculate 3-day average of previous day changes.
    avg_3day = (p_day1 + p_day2 + p_day3) / 3
    """
    # Use high precision for calculation, round only for display if needed
    # But Python floats are double precision usually sufficient.
    avg = (p1 + p2 + p3) / 3.0
    return avg

def get_strength_score(label: str) -> int:
    """Convert strength label to numeric score."""
    if label == "Buyers":
        return 1
    elif label == "Sellers":
        return -1
    return 0

def calculate_avg_strength_label(s1: str, s2: str, s3: str) -> str:
    """
    Calculate 3D Avg Strength based on daily strength labels.
    
    1. Convert labels to scores (Buyers=+1, Balanced=0, Sellers=-1)
    2. Average the scores
    3. Map average score:
       - score > 0.2  -> "Buyers"
       - score < -0.2 -> "Sellers"
       - else         -> "Balanced"
    """
    score1 = get_strength_score(s1)
    score2 = get_strength_score(s2)
    score3 = get_strength_score(s3)
    
    avg_score = (score1 + score2 + score3) / 3.0
    
    if avg_score > 0.2:
        return "Buyers"
    elif avg_score < -0.2:
        return "Sellers"
    return "Balanced"
