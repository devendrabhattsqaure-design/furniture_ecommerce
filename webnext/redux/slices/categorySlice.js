// redux/slices/categorySlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchCategories } from '@/services/category.js';

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories(state, action) {
      state.categories = action.payload;
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

export const getCategories = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    const categories = await fetchCategories();
    dispatch(setCategories(categories));
    dispatch(setLoading(false));
    
    return categories;
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(setError(error.message));
    throw error;
  }
};

export const { setCategories, setLoading, setError, clearError } = categorySlice.actions;
export default categorySlice.reducer;