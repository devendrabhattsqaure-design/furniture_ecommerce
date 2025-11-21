// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API calls
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
  async ({ product_id, quantity }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id, quantity }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }
      
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/cart/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update cart');
      }
      
      return { itemId, quantity, ...data.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const normalizeCartItem = (item) => {
  // Handle both API response structure and local structure
  return {
    id: item.product_id || item.id,
    product_id: item.product_id || item.id,
    cart_item_id: item.cart_item_id,
    name: item.product_name || item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image_url || item.image,
    stock_quantity: item.stock_quantity
  };
};

export const removeFromCartAPI = createAsyncThunk(
  'cart/removeFromCartAPI',
  async (itemId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove from cart');
      }
      
      return { itemId, ...data.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper functions for localStorage
const getStoredCart = () => {
  if (typeof window !== 'undefined') {
    try {
      return JSON.parse(localStorage.getItem('cart')) || { items: [], totalPrice: 0, totalQuantity: 0 };
    } catch (error) {
      console.error('Error parsing stored cart:', error);
      return { items: [], totalPrice: 0, totalQuantity: 0 };
    }
  }
  return { items: [], totalPrice: 0, totalQuantity: 0 };
};

const saveCartToStorage = (cart) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
};

const initialState = {
  items: getStoredCart().items,
  totalPrice: getStoredCart().totalPrice,
  totalQuantity: getStoredCart().totalQuantity,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { id, name, price, image, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ id, name, price, image, quantity });
      }

      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      // Save to localStorage after update
      saveCartToStorage({
        items: state.items,
        totalPrice: state.totalPrice,
        totalQuantity: state.totalQuantity
      });
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      // Save to localStorage after update
      saveCartToStorage({
        items: state.items,
        totalPrice: state.totalPrice,
        totalQuantity: state.totalQuantity
      });
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      // Save to localStorage after update
      saveCartToStorage({
        items: state.items,
        totalPrice: state.totalPrice,
        totalQuantity: state.totalQuantity
      });
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
    },
    loadCartFromStorage(state) {
      const storedCart = getStoredCart();
      state.items = storedCart.items;
      state.totalPrice = storedCart.totalPrice;
      state.totalQuantity = storedCart.totalQuantity;
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
export const { 
  addToCart,
  addToCartLocal,
  removeFromCart, 
  removeFromCartLocal,
  updateQuantity,
  updateQuantityLocal, 
  clearCart,
  clearCartLocal,
  setCartFromAPI,
  clearError ,
  
  loadCartFromStorage,
} = cartSlice.actions;


export default cartSlice.reducer;