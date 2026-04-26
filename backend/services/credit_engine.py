from datetime import datetime, date
from collections import defaultdict
import math

def calculate_credit_score(farmer, activities):
    """
    AgroSphere Credit Scoring Engine (Rule-Based MVP)
    
    Score = 0-100 based on:
    - Volume of activities logged (30 pts)
    - Activity consistency over time (30 pts)
    - Diversity of activity types (20 pts)
    - Farm profile completeness (20 pts)
    """

    score = 0
    breakdown = {}

    # === 1. Volume Score (0-30) ===
    total_activities = len(activities)
    volume_score = min(30, total_activities * 3)
    breakdown["volume"] = volume_score
    score += volume_score

    if total_activities == 0:
        return {
            "score": 0,
            "risk_level": "High",
            "risk_color": "red",
            "breakdown": breakdown,
            "recommendations": ["Start logging farm activities to build your credit score."]
        }

    # === 2. Consistency Score (0-30) ===
    dates = []
    for a in activities:
        try:
            d = datetime.strptime(a.date, "%Y-%m-%d").date()
            dates.append(d)
        except:
            pass

    consistency_score = 0
    if len(dates) >= 2:
        dates.sort()
        # Check unique weeks with activity
        weeks = set()
        for d in dates:
            week = d.isocalendar()[:2]  # (year, week)
            weeks.add(week)
        
        # Span in weeks from first to last activity
        span_days = (dates[-1] - dates[0]).days
        span_weeks = max(1, span_days // 7)
        week_coverage = len(weeks) / span_weeks
        consistency_score = min(30, int(week_coverage * 30))
    elif len(dates) == 1:
        consistency_score = 10  # At least started

    breakdown["consistency"] = consistency_score
    score += consistency_score

    # === 3. Diversity Score (0-20) ===
    activity_types = set(a.activity_type.lower() for a in activities)
    known_types = {"planting", "feeding", "harvesting", "other", "spraying", "watering", "fertilizing"}
    matched = activity_types.intersection(known_types)
    diversity_score = min(20, len(matched) * 5)
    breakdown["diversity"] = diversity_score
    score += diversity_score

    # === 4. Profile Completeness (0-20) ===
    profile_fields = [
        farmer.location, farmer.farm_type, farmer.farm_size,
        farmer.phone, farmer.bio
    ]
    filled = sum(1 for f in profile_fields if f)
    profile_score = int((filled / len(profile_fields)) * 20)
    breakdown["profile"] = profile_score
    score += profile_score

    # === Risk Classification ===
    if score >= 70:
        risk_level = "Low"
        risk_color = "green"
    elif score >= 40:
        risk_level = "Medium"
        risk_color = "yellow"
    else:
        risk_level = "High"
        risk_color = "red"

    # === Recommendations ===
    recommendations = []
    if breakdown["volume"] < 15:
        recommendations.append("Log more farm activities to improve your score.")
    if breakdown["consistency"] < 15:
        recommendations.append("Log activities more regularly — weekly consistency boosts your score.")
    if breakdown["diversity"] < 10:
        recommendations.append("Log different types of activities (planting, feeding, harvesting).")
    if breakdown["profile"] < 15:
        recommendations.append("Complete your farm profile including phone and bio.")
    if not recommendations:
        recommendations.append("Excellent! Keep logging activities consistently.")

    return {
        "score": score,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "breakdown": breakdown,
        "recommendations": recommendations
    }
