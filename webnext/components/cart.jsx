// components/cart.jsx
'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchCart, 
  updateCartItemAPI, 
  removeFromCartAPI,
  updateQuantity,
  removeFromCart,
  clearError 
} from '@/redux/slices/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Cart({ isOpen, onClose }) {
  const dispatch = useAppDispatch();
  const { items, totalPrice, totalQuantity, loading, error, isAuthenticated } = useAppSelector(state => state.cart);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isOpen, isAuthenticated, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleUpdateQuantity = async (itemId, productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    if (isAuthenticated) {
      // Use API for authenticated users
      setUpdatingItems(prev => new Set(prev).add(itemId));
      try {
        await dispatch(updateCartItemAPI({ itemId, quantity: newQuantity })).unwrap();
      } catch (error) {
        console.error('Failed to update quantity:', error);
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    } else {
      // Use local action for non-authenticated users
      dispatch(updateQuantity({ id: productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = async (itemId, productId) => {
    if (isAuthenticated) {
      // Use API for authenticated users
      setUpdatingItems(prev => new Set(prev).add(itemId));
      try {
        await dispatch(removeFromCartAPI(itemId)).unwrap();
      } catch (error) {
        console.error('Failed to remove item:', error);
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    } else {
      // Use local action for non-authenticated users
      dispatch(removeFromCart(productId));
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please login to checkout');
      return;
    }
    onClose();
    window.location.href = '/checkout';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Cart Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            Shopping Cart ({totalQuantity})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🛒</div>
              <p className="text-gray-500">Your cart is empty</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.cart_item_id || item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="flex gap-4 py-4 border-b"
                >
                  {/* Product Image */}
                  <img
                    src={item.image_url || item.image || '/placeholder.svg'}
                    alt={item.product_name || item.name}
                    className="w-16 h-16 object-cover rounded"
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {item.product_name || item.name}
                    </h3>
                    <p className="text-green-600 font-semibold">
                      ₹{item.price}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(
                          item.cart_item_id, 
                          item.product_id || item.id, 
                          item.quantity - 1
                        )}
                        disabled={updatingItems.has(item.cart_item_id) || item.quantity <= 1}
                        className="w-6 h-6 flex items-center justify-center border rounded disabled:opacity-50"
                      >
                        −
                      </button>
                      
                      <span className="w-8 text-center text-sm">
                        {updatingItems.has(item.cart_item_id) ? '...' : item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleUpdateQuantity(
                          item.cart_item_id, 
                          item.product_id || item.id, 
                          item.quantity + 1
                        )}
                        disabled={updatingItems.has(item.cart_item_id)}
                        className="w-6 h-6 flex items-center justify-center border rounded disabled:opacity-50"
                      >
                        +
                      </button>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(
                          item.cart_item_id, 
                          item.product_id || item.id
                        )}
                        disabled={updatingItems.has(item.cart_item_id)}
                        className="ml-auto text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* Total */}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>

            {!isAuthenticated && (
              <Link
                href="/login"
                className="block w-full text-center py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                onClick={onClose}
              >
                Sign In to Checkout
              </Link>
            )}

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}