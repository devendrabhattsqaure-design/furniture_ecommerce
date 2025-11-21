// redux/slices/productSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchProducts, fetchProductById } from '@/services/product.js';

const initialState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  pagination: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action) {
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
    },
    setSelectedProduct(state, action) {
      state.selectedProduct = action.payload;
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
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
  },
});

export const getProducts = (filters = {}) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    const response = await fetchProducts(filters);
    
    // Extract data from API response
    if (response.success) {
      dispatch(setProducts({
        products: response.data,
        pagination: response.pagination
      }));
    } else {
      throw new Error(response.message || 'Failed to fetch products');
    }
    
    dispatch(setLoading(false));
    return response;
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(setError(error.message));
    throw error;
  }
};

export const getProductById = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());
    dispatch(clearSelectedProduct()); // Clear previous product
    
    const response = await fetchProductById(id);
    
    // Extract data from API response
    if (response.success) {
      dispatch(setSelectedProduct(response.data));
    } else {
      throw new Error(response.message || 'Failed to fetch product');
    }
    
    dispatch(setLoading(false));
    return response.data;
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(setError(error.message));
    throw error;
  }
};

export const { 
  setProducts, 
  setSelectedProduct, 
  setLoading, 
  setError, 
  clearError, 
  clearSelectedProduct 
} = productSlice.actions;
export default productSlice.reducer;