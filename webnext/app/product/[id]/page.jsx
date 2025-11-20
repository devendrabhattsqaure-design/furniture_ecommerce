'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { addToCart } from '@/redux/slices/cartSlice.js';
import { FEATURED_PRODUCTS } from '@/lib/constants.js';

export default function ProductDetailPage({ params }) {
  const product = FEATURED_PRODUCTS.find(p => p.id === params.id);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([
    { name: 'John D.', text: 'Amazing quality!', rating: 5 },
    { name: 'Sarah M.', text: 'Very comfortable', rating: 5 },
  ]);

  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-2xl text-foreground/70">Product not found</p>
        </div>
        <Footer />
      </>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      const newReview = {
        name: 'You',
        text: e.target.review.value,
        rating: parseInt(e.target.rating.value),
      };
      setReviews([...reviews, newReview]);
      setShowReviewModal(false);
    } else {
      alert('Please login to submit a review');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12"
          >
            {/* Image */}
            <div className="bg-accent rounded-2xl p-8 flex items-center justify-center h-96">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-primary">${product.price}</span>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐ {product.rating}</span>
                  <span className="text-foreground/70">({product.reviews} reviews)</span>
                </div>
              </div>

              <p className="text-foreground/70 mb-8 leading-relaxed">
                Premium quality furniture crafted with precision and designed for modern living spaces. Features high-end materials and exceptional craftsmanship.
              </p>

              {/* Options */}
              <div className="space-y-6 mb-8">
                {/* Color */}
                <div>
                  <label className="block font-semibold mb-3">Color</label>
                  <div className="flex gap-3">
                    {['Black', 'Gray', 'Beige'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-6 py-2 rounded-lg border-2 transition ${
                          selectedColor === color
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block font-semibold mb-3">Size</label>
                  <div className="flex gap-3">
                    {['Small', 'Medium', 'Large'].map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-2 rounded-lg border-2 transition ${
                          selectedSize === size
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block font-semibold mb-3">Quantity</label>
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-accent rounded-lg hover:bg-primary/10 transition"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 bg-accent rounded-lg hover:bg-primary/10 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Add to Cart
                </motion.button>
                <button className="flex-1 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition">
                  Add to Wishlist ❤️
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-accent rounded-2xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              {isAuthenticated && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
                >
                  Write Review
                </button>
              )}
            </div>

            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <div key={idx} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{review.name}</h4>
                    <span className="text-yellow-400">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <p className="text-foreground/70">{review.text}</p>
                </div>
              ))}
            </div>

            {/* Review Modal */}
            {showReviewModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowReviewModal(false)}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-background rounded-2xl p-6 max-w-md w-full"
                >
                  <h3 className="text-2xl font-bold mb-4">Write a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <select
                        name="rating"
                        defaultValue="5"
                        className="w-full px-4 py-2 bg-accent rounded-lg border border-border"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                        <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                        <option value="3">⭐⭐⭐ 3 Stars</option>
                        <option value="2">⭐⭐ 2 Stars</option>
                        <option value="1">⭐ 1 Star</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <textarea
                        name="review"
                        required
                        className="w-full px-4 py-3 bg-accent rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="4"
                        placeholder="Share your experience..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(false)}
                        className="flex-1 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
