'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { addToCart } from '@/redux/slices/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '@/redux/slices/wishlistSlice.js';

export default function ProductCard({ id, name, price, image, rating, reviews }) {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const isWishlisted = wishlistItems.some(item => item.id === id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }
    dispatch(addToCart({ id, name, price, image, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist(id));
    } else {
      dispatch(addToWishlist({ id, name, price, image }));
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -8 }}
        className="bg-accent rounded-2xl overflow-hidden group cursor-pointer"
      >
        <Link href={`/product/${id}`}>
          <div className="relative h-64 overflow-hidden bg-background">
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />
            <button
              onClick={handleWishlist}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition"
            >
              {isWishlisted ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{name}</h3>
            <div className="flex justify-between items-center mb-3">
              <span className="text-primary font-bold text-xl">${price}</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-sm text-foreground/70">
                  {rating} ({reviews})
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Add to Cart
            </button>
          </div>
        </Link>
      </motion.div>

      {/* Login Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-background rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-xl font-bold mb-4">Sign In Required</h3>
            <p className="text-foreground/70 mb-6">
              Please sign in to add items to your cart and wishlist.
            </p>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition text-center"
              >
                Sign In
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
