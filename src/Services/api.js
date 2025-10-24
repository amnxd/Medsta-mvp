import axios from 'axios';
import { auth } from '@/Services/firebase.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
});

// Attach Firebase ID token when available
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken().catch(() => null);
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
});

export default api;
