from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models
from auth import get_current_user

router = APIRouter()

class ActivityCreate(BaseModel):
    activity_type: str  # planting / feeding / harvesting / other
    description: Optional[str] = None
    quantity: Optional[str] = None
    unit: Optional[str] = None
    date: str
    notes: Optional[str] = None

@router.post("/")
def log_activity(data: ActivityCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Create a farmer profile first")

    activity = models.Activity(farmer_id=farmer.id, **data.dict())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return {"message": "Activity logged", "activity_id": activity.id}

@router.get("/my")
def get_my_activities(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    activities = db.query(models.Activity).filter(models.Activity.farmer_id == farmer.id).order_by(models.Activity.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "activity_type": a.activity_type,
            "description": a.description,
            "quantity": a.quantity,
            "unit": a.unit,
            "date": a.date,
            "notes": a.notes,
            "created_at": str(a.created_at)
        } for a in activities
    ]

@router.get("/{farmer_id}")
def get_activities_by_farmer(farmer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    activities = db.query(models.Activity).filter(models.Activity.farmer_id == farmer_id).order_by(models.Activity.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "activity_type": a.activity_type,
            "description": a.description,
            "quantity": a.quantity,
            "unit": a.unit,
            "date": a.date,
            "notes": a.notes,
            "created_at": str(a.created_at)
        } for a in activities
    ]

@router.delete("/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id, models.Activity.farmer_id == farmer.id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(activity)
    db.commit()
    return {"message": "Activity deleted"}
