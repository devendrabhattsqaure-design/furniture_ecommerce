// components/product-card.jsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppDispatch } from '@/redux/hooks.js';
import { addToCart } from '@/redux/slices/cartSlice.js';

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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch(addToCart({
      id,
      name,
      price,
      image,
      quantity: 1
    }));
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