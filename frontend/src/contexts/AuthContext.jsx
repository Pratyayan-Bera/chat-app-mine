import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from './ToastContext';

const AuthContext = createContext(undefined);

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://chill-chat-server.onrender.com/api';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true; // Important for cookie-based auth

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chatapp_user');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Check for existing user on app start
    const initializeAuth = async () => {
      try {
        // Try to get current user from backend (validates JWT cookie)
        const response = await axios.get('/auth/me');
        const userData = {
          id: response.data.id,
          name: response.data.fullName,
          email: response.data.email,
          avatar: response.data.profilePicture
        };
        setUser(userData);
        localStorage.setItem('chatapp_user', JSON.stringify(userData));
      } catch (error) {
        // No valid session, clear any stored data
        localStorage.removeItem('chatapp_user');
      }
      setInitialLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });

      const userData = {
        id: response.data.id,
        name: response.data.fullName,
        email: response.data.email,
        avatar: response.data.profilePicture
      };
      
      setUser(userData);
      localStorage.setItem('chatapp_user', JSON.stringify(userData));
      showToast('Login successful!', 'success');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      showToast(message, 'error');
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (fullName, email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/signup', {
        fullName,
        email,
        password
      });

      const userData = {
        id: response.data.id,
        name: response.data.fullName,
        email: response.data.email,
        avatar: response.data.profilePicture
      };
      
      setUser(userData);
      localStorage.setItem('chatapp_user', JSON.stringify(userData));
      showToast('Account created successfully!', 'success');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      showToast(message, 'error');
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      setUser(null);
      localStorage.removeItem('chatapp_user');
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;

    try {
      let updatedUser;

      // Handle different types of profile updates based on your backend endpoints
      if (updates.name && updates.name !== user.name) {
        const response = await axios.put('/auth/updateUser/fullName', {
          newFullName: updates.name
        });
        updatedUser = response.data;
      }

      if (updates.avatar && updates.avatar !== user.avatar) {
        const response = await axios.put('/auth/updateUser/profilePicture', {
          newProfilePicture: updates.avatar
        });
        updatedUser = response.data;
      }

      if (updates.password) {
        const response = await axios.put('/auth/updateUser/password', {
          oldPassword: updates.oldPassword,
          newPassword: updates.password
        });
        updatedUser = response.data;
      }

      if (updatedUser) {
        const userData = {
          id: updatedUser._id,
          name: updatedUser.fullName,
          email: updatedUser.email,
          avatar: updatedUser.profilePicture
        };
        
        setUser(userData);
        localStorage.setItem('chatapp_user', JSON.stringify(userData));
        showToast('Profile updated successfully!', 'success');
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.massage || 'Profile update failed. Please try again.';
      showToast(message, 'error');
      throw new Error(message);
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await axios.get('/auth/getAllUsers');
      return response.data.map(user => ({
        id: user._id,
        name: user.fullName,
        email: user.email,
        avatar: user.profilePicture,
        online: false // You'll need to implement online status separately
      }));
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users';
      showToast(message, 'error');
      throw new Error(message);
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    getAllUsers,
    loading,
    initialLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}