import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create axios instance with base config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Helper function to extract product ID
const extractProductId = (input) => {
  console.log('🔄 extractProductId input:', input);
  
  // If it's already a number or string number, return it
  if (typeof input === 'number') return input;
  if (typeof input === 'string' && !isNaN(parseInt(input))) return parseInt(input);
  
  // If it's an object with product_id
  if (typeof input === 'object' && input.product_id) {
    return input.product_id;
  }
  
  // If it's an object with id
  if (typeof input === 'object' && input.id) {
    return input.id;
  }
  
  throw new Error('Invalid product ID format');
};

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wishlist', getAuthConfig());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (input, { rejectWithValue }) => {
    try {
      // Extract product ID from whatever is passed
      const productId = extractProductId(input);
      
      console.log('✅ Final product ID to send to API:', productId);
      console.log('✅ Type of product ID:', typeof productId);
      
      const response = await api.post('/wishlist', { productId }, getAuthConfig());
      return { productId, message: response.data.message };
    } catch (error) {
      console.error('❌ Add to wishlist error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (input, { rejectWithValue }) => {
    try {
      // Extract product ID from whatever is passed
      const productId = extractProductId(input);
      
      console.log('✅ Final product ID to remove:', productId);
      await api.delete(`/wishlist/${productId}`, getAuthConfig());
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

export const checkWishlistStatus = createAsyncThunk(
  'wishlist/checkWishlistStatus',
  async (input, { rejectWithValue }) => {
    try {
      // Extract product ID from whatever is passed
      const productId = extractProductId(input);
      
      const response = await api.get(`/wishlist/check/${productId}`, getAuthConfig());
      return { productId, inWishlist: response.data.inWishlist };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check wishlist status');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
    wishlistStatus: {} // Track wishlist status for individual products
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.error = null;
    },
    clearWishlistError: (state) => {
      state.error = null;
    },
    updateWishlistStatus: (state, action) => {
      state.wishlistStatus[action.payload.productId] = action.payload.status;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        
        // Update wishlist status for all fetched items
        action.payload.forEach(item => {
          state.wishlistStatus[item.product_id] = true;
        });
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to wishlist
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.wishlistStatus[action.payload.productId] = true;
        state.error = null;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove from wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.product_id !== action.payload);
        state.wishlistStatus[action.payload] = false;
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Check wishlist status
      .addCase(checkWishlistStatus.fulfilled, (state, action) => {
        state.wishlistStatus[action.payload.productId] = action.payload.inWishlist;
      })
      .addCase(checkWishlistStatus.rejected, (state, action) => {
        // If check fails, assume not in wishlist
        const productId = extractProductId(action.meta.arg);
        state.wishlistStatus[productId] = false;
      });
  }
});

export const { clearWishlist, clearWishlistError, updateWishlistStatus } = wishlistSlice.actions;
export default wishlistSlice.reducer;