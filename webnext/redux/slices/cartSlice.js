// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:5000/api';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/cart`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCartAPI = createAsyncThunk(
  'cart/addToCartAPI',
  async ({ product_id, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ product_id, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemAPI = createAsyncThunk(
  'cart/updateCartItemAPI',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/cart/item/${itemId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update cart item');
      }

      const data = await response.json();
      return { itemId, quantity, ...data.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCartAPI = createAsyncThunk(
  'cart/removeFromCartAPI',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from cart');
      }

      const data = await response.json();
      return { itemId, ...data.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCartAPI = createAsyncThunk(
  'cart/clearCartAPI',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/cart/clear`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear cart');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper functions for localStorage
const getStoredCart = () => {
  if (typeof window !== 'undefined') {
    try {
      return JSON.parse(localStorage.getItem('localCart')) || { items: [], totalPrice: 0, totalQuantity: 0 };
    } catch (error) {
      return { items: [], totalPrice: 0, totalQuantity: 0 };
    }
  }
  return { items: [], totalPrice: 0, totalQuantity: 0 };
};

const saveCartToStorage = (cart) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('localCart', JSON.stringify(cart));
  }
};

const initialState = {
  items: [],
  totalPrice: 0,
  totalQuantity: 0,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Local cart actions (for non-authenticated users)
    addToCart: (state, action) => {
      const { id, name, price, image, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ 
          id, 
          name, 
          price, 
          image, 
          quantity,
          cart_item_id: `local_${id}` // Create a local ID
        });
      }

      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Save to localStorage for non-authenticated users
      if (!state.isAuthenticated) {
        saveCartToStorage({
          items: state.items,
          totalPrice: state.totalPrice,
          totalQuantity: state.totalQuantity
        });
      }
    },
    
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      if (!state.isAuthenticated) {
        saveCartToStorage({
          items: state.items,
          totalPrice: state.totalPrice,
          totalQuantity: state.totalQuantity
        });
      }
    },
    
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      if (!state.isAuthenticated) {
        saveCartToStorage({
          items: state.items,
          totalPrice: state.totalPrice,
          totalQuantity: state.totalQuantity
        });
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      
      if (!state.isAuthenticated) {
        localStorage.removeItem('localCart');
      }
    },
    
    setAuthentication: (state, action) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        // When logging out, load local cart
        const localCart = getStoredCart();
        state.items = localCart.items;
        state.totalPrice = localCart.totalPrice;
        state.totalQuantity = localCart.totalQuantity;
      }
    },
    
    loadLocalCart: (state) => {
      if (!state.isAuthenticated) {
        const localCart = getStoredCart();
        state.items = localCart.items;
        state.totalPrice = localCart.totalPrice;
        state.totalQuantity = localCart.totalQuantity;
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.total || 0;
        state.totalQuantity = action.payload.totalItems || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Cart API
      .addCase(addToCartAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.total || 0;
        state.totalQuantity = action.payload.totalItems || 0;
      })
      .addCase(addToCartAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Cart Item API
      .addCase(updateCartItemAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.totalPrice = action.payload.total || 0;
        state.totalQuantity = action.payload.totalItems || 0;
        // Update the specific item quantity
        const item = state.items.find(item => item.cart_item_id === action.payload.itemId);
        if (item) {
          item.quantity = action.payload.quantity;
        }
      })
      .addCase(updateCartItemAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from Cart API
      .addCase(removeFromCartAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.totalPrice = action.payload.total || 0;
        state.totalQuantity = action.payload.totalItems || 0;
        // Remove item from local state
        state.items = state.items.filter(item => item.cart_item_id !== action.payload.itemId);
      })
      .addCase(removeFromCartAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear Cart API
      .addCase(clearCartAPI.fulfilled, (state) => {
        state.items = [];
        state.totalPrice = 0;
        state.totalQuantity = 0;
      });
  },
});

export const { 
  addToCart,
  removeFromCart, 
  updateQuantity,
  clearCart,
  setAuthentication,
  loadLocalCart,
  clearError
} = cartSlice.actions;

export default cartSlice.reducer;