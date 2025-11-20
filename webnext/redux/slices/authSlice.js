import { createSlice } from '@reduxjs/toolkit';
import { login, register, logout } from '../../services/auth.js';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),
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
    },
    logoutUser(state) {  // Changed from logout to logoutUser
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
    
    // Store token and user data
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    
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
    
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    dispatch(setUser(userData));
    dispatch(setLoading(false));
    
    return userData;
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(setError(error.message));
    throw error;
  }
};

export const logoutUserAsync = () => async (dispatch) => {  // Changed from logoutUser to logoutUserAsync
  await logout();
  dispatch(logoutUser());  // Dispatch the action creator
};

// Export actions - note: logoutUser is now the action creator name
export const { setUser, logoutUser, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;