from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter()

# Geocoding map for common Nigerian cities
CITY_COORDS = {
    "lagos": (6.5244, 3.3792),
    "abuja": (9.0765, 7.3986),
    "kano": (12.0022, 8.5920),
    "ibadan": (7.3775, 3.9470),
    "kaduna": (10.5264, 7.4382),
    "port harcourt": (4.8156, 7.0498),
    "benin city": (6.3350, 5.6270),
    "maiduguri": (11.8311, 13.1510),
    "jos": (9.9285, 8.8921),
    "enugu": (6.4584, 7.5464),
}

WEATHER_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Icy fog", 51: "Light drizzle", 61: "Slight rain",
    63: "Moderate rain", 65: "Heavy rain", 80: "Rain showers", 95: "Thunderstorm"
}

def get_farming_advice(code, temp):
    if code in [61, 63, 65, 80]:
        return {"alert": "🌧️ Rain expected", "advice": "Delay planting or harvesting activities. Good time for crop inspection."}
    elif code == 95:
        return {"alert": "⛈️ Thunderstorm warning", "advice": "Avoid outdoor farm work. Secure equipment and livestock."}
    elif code in [0, 1]:
        if temp > 35:
            return {"alert": "☀️ High heat warning", "advice": "Water crops early morning or late evening. Ensure livestock have shade."}
        return {"alert": "✅ Clear conditions", "advice": "Ideal conditions for outdoor farming activities."}
    elif code in [2, 3]:
        return {"alert": "⛅ Cloudy", "advice": "Good conditions for field work. Low evaporation rates."}
    return {"alert": "🌤️ Mixed conditions", "advice": "Monitor weather closely before planning activities."}

@router.get("/")
async def get_weather(city: str = "lagos"):
    city_key = city.lower().strip()
    coords = CITY_COORDS.get(city_key)
    
    if not coords:
        coords = (6.5244, 3.3792)  # Default to Lagos
        city_key = "lagos"

    lat, lon = coords
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
        f"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
        f"&timezone=Africa%2FLagos&forecast_days=5"
    )

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=10)
            data = response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Weather service unavailable: {str(e)}")

    current = data.get("current", {})
    daily = data.get("daily", {})
    
    weather_code = current.get("weather_code", 0)
    temp = current.get("temperature_2m", 25)
    advice = get_farming_advice(weather_code, temp)

    forecast = []
    if daily.get("time"):
        for i in range(min(5, len(daily["time"]))):
            code = daily["weather_code"][i] if daily.get("weather_code") else 0
            forecast.append({
                "date": daily["time"][i],
                "weather": WEATHER_CODES.get(code, "Unknown"),
                "max_temp": daily["temperature_2m_max"][i] if daily.get("temperature_2m_max") else None,
                "min_temp": daily["temperature_2m_min"][i] if daily.get("temperature_2m_min") else None,
                "precipitation": daily["precipitation_sum"][i] if daily.get("precipitation_sum") else 0,
            })

    return {
        "city": city_key.title(),
        "current": {
            "temperature": temp,
            "humidity": current.get("relative_humidity_2m"),
            "wind_speed": current.get("wind_speed_10m"),
            "weather": WEATHER_CODES.get(weather_code, "Unknown"),
            "weather_code": weather_code,
        },
        "alert": advice["alert"],
        "farming_advice": advice["advice"],
        "forecast": forecast
    }

@router.get("/cities")
def get_available_cities():
    return {"cities": list(CITY_COORDS.keys())}
