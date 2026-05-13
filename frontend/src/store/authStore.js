import { create } from 'zustand';
import axios from 'axios';
import client from '../api/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  permissions: [],
  isInitialized: false,

  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password }, { withCredentials: true });
    set({
      user: response.data.user,
      accessToken: response.data.accessToken,
      permissions: response.data.user.permissions || [],
      isInitialized: true
    });
  },

  refreshToken: async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      set({ accessToken: response.data.accessToken });
      
      const meResponse = await client.get('/auth/me');
      set({ 
        user: meResponse.data.user, 
        permissions: meResponse.data.user.permissions || [],
        isInitialized: true 
      });
    } catch (error) {
      set({ user: null, accessToken: null, permissions: [], isInitialized: true });
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Error logging out", error);
    } finally {
      set({ user: null, accessToken: null, permissions: [] });
    }
  },

  can: (module, action) => {
    const { permissions } = get();
    if (!permissions) return false;
    return permissions.some(p => p.module === module && p.action === action);
  }
}));

export default useAuthStore;
