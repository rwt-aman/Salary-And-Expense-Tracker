import axios from 'axios';

const defaultBaseURL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://salary-and-expense-tracker-backend.onrender.com/api';

const rawBaseURL = import.meta.env.VITE_API_URL || defaultBaseURL;
const baseURL = rawBaseURL.endsWith('/api')
  ? rawBaseURL
  : `${rawBaseURL.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Seed the in-memory token from localStorage so it survives page refreshes.
let authToken = localStorage.getItem('token') || null;

// This function gets called from outside (e.g. after login) to set the token
// that every future request should carry.
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Runs before every single request automatically -- attaches the JWT
// so we never have to manually add it in every component.
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export default api;
