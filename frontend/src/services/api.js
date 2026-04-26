import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Farmer
export const createFarmerProfile = (data) => api.post('/farmers/', data);
export const getMyProfile = () => api.get('/farmers/me');
export const getAllFarmers = () => api.get('/farmers/');
export const getFarmerById = (id) => api.get(`/farmers/${id}`);

// Activities
export const logActivity = (data) => api.post('/activities/', data);
export const getMyActivities = () => api.get('/activities/my');
export const getActivitiesByFarmer = (id) => api.get(`/activities/${id}`);
export const deleteActivity = (id) => api.delete(`/activities/${id}`);

// Credit
export const getMyCreditScore = () => api.get('/credit-score/me');
export const getCreditScore = (id) => api.get(`/credit-score/${id}`);

// Weather
export const getWeather = (city) => api.get(`/weather/?city=${city}`);
export const getWeatherCities = () => api.get('/weather/cities');

export default api;
