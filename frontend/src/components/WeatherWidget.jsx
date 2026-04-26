import { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, Zap, Wind, Droplets } from 'lucide-react';
import { getWeather } from '../services/api';

const WeatherIcon = ({ code, className }) => {
  if (code >= 95) return <Zap className={className} />;
  if (code >= 51) return <CloudRain className={className} />;
  if (code >= 2) return <Cloud className={className} />;
  return <Sun className={className} />;
};

export default function WeatherWidget({ city = 'lagos' }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeather(city)
      .then(res => setWeather(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) return (
    <div className="card bg-gradient-to-br from-primary-700 to-primary-900 text-white animate-pulse">
      <div className="h-4 w-32 bg-white/20 rounded mb-3" />
      <div className="h-8 w-16 bg-white/20 rounded" />
    </div>
  );

  if (!weather) return null;

  return (
    <div className="card bg-gradient-to-br from-primary-700 to-primary-900 text-white border-0">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-primary-200 text-xs font-medium mb-1">📍 {weather.city}</p>
          <div className="flex items-end gap-2">
            <span className="font-display font-bold text-3xl">{Math.round(weather.current.temperature)}°C</span>
            <span className="text-primary-200 text-sm pb-1">{weather.current.weather}</span>
          </div>
          <div className="flex gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-primary-200">
              <Droplets className="w-3 h-3" /> {weather.current.humidity}%
            </span>
            <span className="flex items-center gap-1 text-xs text-primary-200">
              <Wind className="w-3 h-3" /> {Math.round(weather.current.wind_speed)} km/h
            </span>
          </div>
        </div>
        <WeatherIcon code={weather.current.weather_code} className="w-12 h-12 text-white/80" />
      </div>

      {/* Alert banner */}
      <div className="mt-3 bg-white/10 rounded-xl px-3 py-2">
        <p className="text-xs font-semibold text-white">{weather.alert}</p>
        <p className="text-xs text-primary-200 mt-0.5">{weather.farming_advice}</p>
      </div>

      {/* 3-day forecast */}
      {weather.forecast?.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {weather.forecast.slice(0, 4).map((day) => (
            <div key={day.date} className="flex-shrink-0 bg-white/10 rounded-xl px-3 py-2 text-center min-w-[58px]">
              <p className="text-xs text-primary-200">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</p>
              <WeatherIcon code={0} className="w-4 h-4 text-white mx-auto my-1" />
              <p className="text-xs font-semibold text-white">{Math.round(day.max_temp)}°</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
