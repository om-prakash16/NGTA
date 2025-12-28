import pytest
from app.utils.calculations import calculate_strength_label, calculate_3d_avg, calculate_avg_strength_label

def test_case_1():
    """
    Case 1:
      current_change = 1.58
      p_day1 = -0.67
      p_day2 = 1.17
      p_day3 = -0.49
    
    Expected:
      avg_3day approx 0.00
      current_strength = Buyers
      day1_strength = Sellers
      day2_strength = Buyers
      day3_strength = Sellers
      
      avg_strength_score computation:
      -1 + 1 - 1 = -1
      -1 / 3 = -0.33
      -0.33 < -0.2 -> Sellers
    """
    curr = 1.58
    p1 = -0.67
    p2 = 1.17
    p3 = -0.49
    
    # 1. 3D Avg
    avg = calculate_3d_avg(p1, p2, p3)
    # (-0.67 + 1.17 - 0.49) / 3 = 0.01 / 3 = 0.00333
    assert round(avg, 2) == 0.00
    
    # 2. Daily Strengths
    assert calculate_strength_label(curr) == "Buyers"
    assert calculate_strength_label(p1) == "Sellers"
    assert calculate_strength_label(p2) == "Buyers"
    assert calculate_strength_label(p3) == "Sellers"
    
    # 3. Avg Strength
    s1 = calculate_strength_label(p1)
    s2 = calculate_strength_label(p2)
    s3 = calculate_strength_label(p3)
    avg_str = calculate_avg_strength_label(s1, s2, s3)
    assert avg_str == "Sellers"

def test_case_2():
    """
    Case 2:
      p_day1 = -0.72
      p_day2 = -0.24
      p_day3 = 1.06
      
    Expected:
      avg_3day approx 0.03
      day1_strength = Sellers
      day2_strength = Sellers (WAIT: -0.24 < -0.20, so Sellers)
      day3_strength = Buyers
      
      User Example said:
      p_day2 = -0.24 (Balanced = 0) -> WAIT.
      My logic says pct < -0.20 is Sellers. -0.24 is less than -0.20.
      
      NOTE: The USER PROMPT said:
      "p_day2 = -0.24 (Balanced = 0)"
      But also said:
      "if pct < -0.20 -> Sellers"
      
      -0.24 IS less than -0.20. So it should be Sellers.
      Let's re-read the prompt CAREFULLY.
      
      "Thresholds: if pct > 0.20 -> Buyers, else if pct < -0.20 -> Sellers, else Balanced"
      -0.24 < -0.20 is TRUE. So it should be SELLERS.
      
      But the user provided example says: "p_day2 = -0.24 (Balanced = 0)".
      This is a contradiction in the user's prompt. 
      However, usually definitions trump examples.
      OR maybe they meant -0.24 is close to 0?
      
      Wait, let's look at the example AGAIN.
      "But for the earlier example:
       p_day1 = -0.72 (Sellers = -1)
       p_day2 = -0.24 (Balanced = 0)  <-- This contradicts the rule.
       p_day3 =  1.06 (Buyers  = +1)"
       
      Maybe I should treat the rule strictly?
      "if pct < -0.20 -> Sellers".
      -0.24 is definitely < -0.20.
      
      However, if the user explicitly showed an example, maybe they made a typo in the example OR the rule?
      Let's stick to the EXPLICIT RULE DEFINITION: "Fix logic so EVERYTHING matches these rules exactly".
      Rule: "if pct < -0.20 -> Sellers"
      
      I will follow the RULE. -0.24 should be Sellers.
      
      Let's check the FIRST example to see if that aligns.
      p_day1 = -0.67 -> Sellers. Correct.
      p_day2 = 1.17 -> Buyers. Correct.
      p_day3 = -0.49 -> Sellers. Correct.
      
      Okay, I will assume the rule is the source of truth.
      
      Let's modify the test expectation for Case 2 slightly to match the RULE, 
      or I can add a comment explaining the deviation from the user's potentially flawed example description if it fails.
      
      Wait, -0.24 is confusing. Maybe they meant 0.24? No, it has a negative sign.
      
      Let's test strict adherence to 0.20 threshold.
    """
    p1 = -0.72
    p2 = -0.24
    p3 = 1.06
    
    # 1. 3D Avg
    # (-0.72 - 0.24 + 1.06) / 3 = 0.1 / 3 = 0.0333
    avg = calculate_3d_avg(p1, p2, p3)
    assert round(avg, 2) == 0.03
    
    # 2. Daily Strengths
    assert calculate_strength_label(p1) == "Sellers" # -0.72 < -0.20
    assert calculate_strength_label(p2) == "Sellers" # -0.24 < -0.20 (STRICT RULE)
    assert calculate_strength_label(p3) == "Buyers"  # 1.06 > 0.20
    
    # 3. Avg Strength
    # Sellers(-1), Sellers(-1), Buyers(+1)
    # Avg = (-1 - 1 + 1) / 3 = -0.33
    # -0.33 < -0.2 -> Sellers
    
    s1 = calculate_strength_label(p1)
    s2 = calculate_strength_label(p2)
    s3 = calculate_strength_label(p3)
    avg_str = calculate_avg_strength_label(s1, s2, s3)
    
    # If we followed the USER EXAMPLE (where p2=Balanced), it would be Balanced.
    # But strictly following the rule, it is Sellers.
    assert avg_str == "Sellers" 


def test_ashok_leyland_case():
    """
    User Example: Ashok Leyland
    P1 = -1.54 -> Sellers (-1)
    P2 = 1.69 -> Buyers (+1) (Assuming 1.69 > 0.20)
    P3 = -0.19 -> Balanced (0) (Assuming -0.19 > -0.20 and < 0.20)
    
    3D Avg % = (-1.54 + 1.69 - 0.19) / 3 = -0.04 / 3 = -0.0133 -> Round to -0.01
    3D Avg Str Score = (-1 + 1 + 0) / 3 = 0.0
    0.0 is Balanced.
    """
    p1 = -1.54
    p2 = 1.69
    p3 = -0.19
    
    # 1. 3D Avg %
    avg = calculate_3d_avg(p1, p2, p3)
    assert round(avg, 2) == -0.01
    
    # 2. Individual Strengths
    s1 = calculate_strength_label(p1)
    s2 = calculate_strength_label(p2)
    s3 = calculate_strength_label(p3)
    
    assert s1 == "Sellers" # -1.54 < -0.20
    assert s2 == "Buyers"  # 1.69 > 0.20
    assert s3 == "Balanced" # -0.20 < -0.19 < 0.20
    
    # 3. 3D Avg Strength (Score Based)
    # Score = (-1 + 1 + 0) / 3 = 0
    # 0 is between -0.2 and 0.2 -> Balanced
    avg_str = calculate_avg_strength_label(s1, s2, s3)
    assert avg_str == "Balanced" 

