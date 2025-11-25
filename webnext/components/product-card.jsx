// components/product-card.jsx - Updated version
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isAuthenticated) {
        // Use API for authenticated users
        await dispatch(addToCartAPI({ product_id: id, quantity: 1 })).unwrap();
      } else {
        // Use local storage for non-authenticated users
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
      whileHover={{ y: -5 }}
      className="bg-accent rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <Link href={`/product/${id}`}>
        <div className="relative">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="w-full h-48 object-cover"
          />
          {is_on_sale && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
              Sale
            </span>
          )}
          {is_featured && (
            <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded">
              Featured
            </span>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{name}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400">⭐ {rating}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">₹{price}</span>
              {compare_price && compare_price > price && (
                <span className="text-sm text-foreground/50 line-through">
                  ₹{compare_price}
                </span>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition text-sm"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}