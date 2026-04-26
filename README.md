# 🌾 AgroSphere AI

A smart credit scoring platform for farmers. Log farm activities → build a credit score → connect with lenders.

## Demo Flow
**Farmer:** Register → Set up farm profile → Log activities → View credit score  
**Lender:** Register (as lender) → View all farmers → Filter by risk → View detailed profiles

---

## 🚀 Quick Start (Local Development)

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000
npm run dev
# App: http://localhost:3000
```

---

## ☁️ Deployment

### Backend → Render.com
1. Push `/backend` to GitHub
2. Go to render.com → New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   - `SECRET_KEY` = (generate a random 32-char string)
   - `DATABASE_URL` = (add Render PostgreSQL or leave empty for SQLite)
6. Deploy!

### Frontend → Vercel
1. Push `/frontend` to GitHub
2. Go to vercel.com → New Project → Import repo
3. Framework: Vite (auto-detected)
4. Environment Variables:
   - `VITE_API_URL` = your Render backend URL
5. Deploy!

---

## 🧱 Architecture

```
AgroSphere AI
├── backend/               # FastAPI Python backend
│   ├── main.py            # App entry + CORS
│   ├── database.py        # SQLAlchemy setup
│   ├── models.py          # User, Farmer, Activity tables
│   ├── auth.py            # JWT utilities
│   ├── routes/
│   │   ├── auth.py        # /auth/register, /login, /me
│   │   ├── farmers.py     # /farmers CRUD
│   │   ├── activities.py  # /activities CRUD
│   │   ├── credit.py      # /credit-score
│   │   └── weather.py     # /weather (Open-Meteo, free)
│   └── services/
│       └── credit_engine.py  # Scoring algorithm
└── frontend/              # React + Vite + Tailwind
    └── src/
        ├── pages/
        │   ├── Splash.jsx        # Landing page
        │   ├── Login.jsx         # Auth
        │   ├── Register.jsx      # Auth
        │   ├── FarmerSetup.jsx   # Farm profile creation
        │   ├── FarmerDashboard.jsx # Farmer main view
        │   ├── LenderDashboard.jsx # Lender main view
        │   └── FarmerDetail.jsx  # Farmer detail (lender view)
        ├── components/
        │   ├── Navbar.jsx
        │   ├── CreditRing.jsx
        │   ├── WeatherWidget.jsx
        │   └── LogActivityModal.jsx
        └── services/
            └── api.js            # All API calls
```

---

## 📊 Credit Scoring Algorithm

Score (0-100) based on:
| Factor | Max Points | Description |
|--------|-----------|-------------|
| Activity Volume | 30 | More logs = higher score |
| Consistency | 30 | Weekly regularity |
| Activity Diversity | 20 | Different activity types |
| Profile Completeness | 20 | All fields filled |

**Risk Levels:** Low (≥70) · Medium (≥40) · High (<40)

---

## 🌦️ Weather

Uses [Open-Meteo](https://open-meteo.com/) — completely free, no API key needed. Provides 5-day forecasts with farming-specific advice.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python FastAPI |
| Auth | JWT (python-jose + passlib) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Charts | Recharts |
| Weather | Open-Meteo API |
| Deployment | Vercel (frontend) + Render (backend) |
