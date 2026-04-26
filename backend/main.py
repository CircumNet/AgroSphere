from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, farmers, activities, credit, weather

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AgroSphere AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(farmers.router, prefix="/farmers", tags=["Farmers"])
app.include_router(activities.router, prefix="/activities", tags=["Activities"])
app.include_router(credit.router, prefix="/credit-score", tags=["Credit"])
app.include_router(weather.router, prefix="/weather", tags=["Weather"])

@app.get("/")
def root():
    return {"message": "AgroSphere AI API is running"}
