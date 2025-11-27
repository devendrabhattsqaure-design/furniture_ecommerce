'use client';
// Wishlist Page
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { fetchWishlist, removeFromWishlist } from '@/redux/slices/wishlistSlice.js';
import { addToCart } from '@/redux/slices/cartSlice.js';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      id: product.product_id,
      name: product.product_name,
      price: product.price,
      image: product.image_url || "/placeholder.svg",
      quantity: 1
    }));
  };

  if (!isAuthenticated) {
    return (
      <>
        {/* <Navbar /> */}
        <div className="min-h-screen bg-background py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8">Please sign in to view your wishlist.</p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        {/* <Navbar /> */}
        <div className="min-h-screen bg-background py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your wishlist...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <span className="text-gray-600">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Heart size={96} className="mx-auto text-gray-200 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8">
                Start adding items you love to your wishlist. They'll show up here.
              </p>
              <Link
                href="/shop"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6"
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.wishlist_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link
                      href={`/product/${item.product_id}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.product_name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product_id}`}
                        className="block"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition mb-2">
                          {item.product_name}
                        </h3>
                      </Link>
                      
                      {item.category_name && (
                        <p className="text-sm text-gray-600 mb-2">
                          Category: {item.category_name}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-2">
                        SKU: {item.sku}
                      </p>

                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-xl font-bold text-blue-600">
                          ${item.price}
                        </span>
                        {item.compare_price && item.compare_price > item.price && (
                          <span className="text-lg text-gray-500 line-through">
                            ${item.compare_price}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className={`text-sm mb-4 ${
                        item.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.stock_quantity > 0 
                          ? `In Stock (${item.stock_quantity} available)`
                          : 'Out of Stock'
                        }
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.stock_quantity || item.stock_quantity === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </button>
                        
                        <button
                          onClick={() => handleRemoveFromWishlist(item.product_id)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}