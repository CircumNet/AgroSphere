from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    farmer = "farmer"
    lender = "lender"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="farmer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    farmer_profile = relationship("Farmer", back_populates="user", uselist=False)

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    location = Column(String, nullable=False)
    farm_type = Column(String, nullable=False)  # crop / livestock / mixed
    farm_size = Column(Float, nullable=False)    # in hectares
    farm_size_unit = Column(String, default="hectares")
    phone = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="farmer_profile")
    activities = relationship("Activity", back_populates="farmer")

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    activity_type = Column(String, nullable=False)  # planting / feeding / harvesting / other
    description = Column(Text, nullable=True)
    quantity = Column(String, nullable=True)
    unit = Column(String, nullable=True)
    date = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    farmer = relationship("Farmer", back_populates="activities")
