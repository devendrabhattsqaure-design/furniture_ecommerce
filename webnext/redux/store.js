// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import cartReducer from './slices/cartSlice.js';
import wishlistReducer from './slices/wishlistSlice.js';
import themeReducer from './slices/themeSlice.js';
import productReducer from './slices/productSlice.js';
import categoryReducer from './slices/categorySlice.js';
import addressReducer from './slices/addressSlice.js'; // Add this import
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    theme: themeReducer,
    products: productReducer,
    categories: categoryReducer,
    address: addressReducer, // Add this line
    user: userReducer, // Add this line
  },
});