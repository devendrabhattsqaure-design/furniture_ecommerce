// redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { login, register, logout } from '../../services/auth.js';

// Helper function to safely access localStorage
const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }
  return null;
};

const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const initialState = {
  user: getStoredUser(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      
      // Only update localStorage on client side
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    logoutUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Only remove from localStorage on client side
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

// Async action creators
export const loginUser = (email, password) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    const userData = await login(email, password);
    
    // Store token and user data only on client side
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    dispatch(setUser(userData));
    dispatch(setLoading(false));
    
    return userData;
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(setError(error.message));
    throw error;
  }
};

export const registerUser = (name, email, password, phone = '') => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    const userData = await register(name, email, password, phone);
    
    // Store token and user data only on client side
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    dispatch(setUser(userData));
    dispatch(setLoading(false));
    
    return userData;
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(setError(error.message));
    throw error;
  }
};

export const logoutUserAsync = () => async (dispatch) => {
  try {
    // Call logout API if needed
    await logout();
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with local logout even if API fails
  } finally {
    dispatch(logoutUser());
  }
};

// Export actions
export const { setUser, logoutUser, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;