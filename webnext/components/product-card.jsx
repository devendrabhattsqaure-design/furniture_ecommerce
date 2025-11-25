// components/product-card.jsx - Enhanced version
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Eye, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { addToCart, addToCartAPI } from '@/redux/slices/cartSlice.js';

export default function ProductCard({ 
  id, 
  name, 
  price, 
  compare_price, 
  image, 
  rating = 4.5, 
  is_featured = false,
  is_on_sale = false 
}) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const discount = compare_price && compare_price > price 
    ? Math.round(((compare_price - price) / compare_price) * 100) 
    : 0;

  const hasDiscount = discount > 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isAuthenticated) {
        await dispatch(addToCartAPI({ product_id: id, quantity: 1 })).unwrap();
      } else {
        dispatch(addToCart({
          id,
          name,
          price,
          image,
          quantity: 1
        }));
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <Link href={`/product/${id}`}>
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
          <motion.img
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
            src={image || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          
          {/* Badges - Top Left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {is_on_sale && hasDiscount && (
              <motion.div 
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                className="bg-gradient-to-br from-red-500 to-pink-600 text-white px-2.5 py-1 text-xs font-bold rounded-lg shadow-lg flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                {discount}% OFF
              </motion.div>
            )}
            {is_featured && (
              <motion.div 
                initial={{ scale: 0, rotate: 12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-amber-400 to-orange-500 text-white px-2.5 py-1 text-xs font-bold rounded-lg shadow-lg flex items-center gap-1"
              >
                <Star className="w-3 h-3 fill-white" />
                Featured
              </motion.div>
            )}
          </div>

          {/* Quick View - Top Right */}
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors cursor-pointer">
              <Eye className="w-4 h-4 text-gray-700" />
            </div>
          </motion.div>
        </div>
        
        {/* Content Section */}
        <div className="p-3.5">
          {/* Product Name */}
          <h3 className="font-semibold text-base mb-2 line-clamp-2 text-gray-800 group-hover:text-primary transition-colors leading-snug min-h-[2.5rem]">
            {name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(rating) 
                      ? 'text-amber-400 fill-amber-400' 
                      : 'text-gray-300 fill-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-600">
              {rating}
            </span>
            <span className="text-xs text-gray-400">
              (127)
            </span>
          </div>
          
          {/* Price Section */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">₹{price}</span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{compare_price}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                Save ₹{compare_price - price}
              </span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-primary to-primary text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
}