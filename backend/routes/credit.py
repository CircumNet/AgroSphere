from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from auth import get_current_user
from services.credit_engine import calculate_credit_score

router = APIRouter()

@router.get("/me")
def get_my_credit_score(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    activities = db.query(models.Activity).filter(models.Activity.farmer_id == farmer.id).all()
    result = calculate_credit_score(farmer, activities)
    result["farmer_id"] = farmer.id
    result["total_activities"] = len(activities)
    return result

@router.get("/{farmer_id}")
def get_credit_score(farmer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    activities = db.query(models.Activity).filter(models.Activity.farmer_id == farmer_id).all()
    result = calculate_credit_score(farmer, activities)
    result["farmer_id"] = farmer_id
    result["total_activities"] = len(activities)
    return result
