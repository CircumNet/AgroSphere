from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models
from auth import get_current_user, require_lender
from services.credit_engine import calculate_credit_score

router = APIRouter()

class FarmerCreate(BaseModel):
    location: str
    farm_type: str
    farm_size: float
    farm_size_unit: str = "hectares"
    phone: Optional[str] = None
    bio: Optional[str] = None

class FarmerOut(BaseModel):
    id: int
    user_id: int
    location: str
    farm_type: str
    farm_size: float
    farm_size_unit: str
    phone: Optional[str]
    bio: Optional[str]
    full_name: str
    email: str

    class Config:
        from_attributes = True

@router.post("/", response_model=dict)
def create_farmer_profile(data: FarmerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    existing = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Farmer profile already exists")

    farmer = models.Farmer(
        user_id=current_user.id,
        **data.dict()
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    return {"message": "Farmer profile created", "farmer_id": farmer.id}

@router.get("/me")
def get_my_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return {
        "id": farmer.id,
        "user_id": farmer.user_id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "location": farmer.location,
        "farm_type": farmer.farm_type,
        "farm_size": farmer.farm_size,
        "farm_size_unit": farmer.farm_size_unit,
        "phone": farmer.phone,
        "bio": farmer.bio,
        "created_at": str(farmer.created_at)
    }

@router.get("/", response_model=List[dict])
def list_all_farmers(db: Session = Depends(get_db), current_user: models.User = Depends(require_lender)):
    farmers = db.query(models.Farmer).join(models.User).all()
    result = []
    for f in farmers:
        activities = db.query(models.Activity).filter(models.Activity.farmer_id == f.id).all()
        score_data = calculate_credit_score(f, activities)
        result.append({
            "id": f.id,
            "user_id": f.user_id,
            "full_name": f.user.full_name,
            "email": f.user.email,
            "location": f.location,
            "farm_type": f.farm_type,
            "farm_size": f.farm_size,
            "farm_size_unit": f.farm_size_unit,
            "phone": f.phone,
            "bio": f.bio,
            "activity_count": len(activities),
            "credit_score": score_data["score"],
            "risk_level": score_data["risk_level"],
            "created_at": str(f.created_at)
        })
    return result

@router.get("/{farmer_id}")
def get_farmer_by_id(farmer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_lender)):
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    activities = db.query(models.Activity).filter(models.Activity.farmer_id == farmer_id).all()
    score_data = calculate_credit_score(farmer, activities)
    return {
        "id": farmer.id,
        "full_name": farmer.user.full_name,
        "email": farmer.user.email,
        "location": farmer.location,
        "farm_type": farmer.farm_type,
        "farm_size": farmer.farm_size,
        "phone": farmer.phone,
        "bio": farmer.bio,
        "activity_count": len(activities),
        "credit_score": score_data["score"],
        "risk_level": score_data["risk_level"],
        "activities": [{"id": a.id, "type": a.activity_type, "date": a.date, "description": a.description, "notes": a.notes} for a in activities]
    }
