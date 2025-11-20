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
  },
});

export const getProducts = (filters = {}) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    const response = await fetchProducts(filters);
    dispatch(setProducts({
      products: response.data,
      pagination: response.pagination
    }));
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
    
    const product = await fetchProductById(id);
    dispatch(setSelectedProduct(product));
    dispatch(setLoading(false));
    
    return product;
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(setError(error.message));
    throw error;
  }
};

export const { setProducts, setSelectedProduct, setLoading, setError, clearError } = productSlice.actions;
export default productSlice.reducer;