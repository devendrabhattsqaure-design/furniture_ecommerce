'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { addToCart } from '@/redux/slices/cartSlice.js';
import { addToWishlist } from '@/redux/slices/wishlistSlice.js';
import { getProductById } from '@/redux/slices/productSlice.js';

export default function ProductDetailPage({ params }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);

  const dispatch = useAppDispatch();
  const { 
    selectedProduct: product, 
    loading, 
    error 
  } = useAppSelector(state => state.products);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (params.id) {
      dispatch(getProductById(params.id));
    }
  }, [dispatch, params.id]);

  useEffect(() => {
    if (product) {
      // Set default selections
      if (product.color && product.color.length > 0) {
        setSelectedColor(product.color[0]);
      }
      if (product.dimensions && product.dimensions.length > 0) {
        setSelectedSize(product.dimensions[0]);
      }
      // Load reviews if available
      if (product.reviews) {
        setReviews(product.reviews);
      }
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "/placeholder.svg",
        quantity,
        color: selectedColor,
        size: selectedSize
      }));
    }
  };

  const handleAddToWishlist = () => {
    if (product) {
      dispatch(addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "/placeholder.svg",
        color: selectedColor,
        size: selectedSize
      }));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to submit a review');
      return;
    }

    const formData = new FormData(e.target);
    const reviewData = {
      rating: parseInt(formData.get('rating')),
      comment: formData.get('review'),
      userName: user?.name || 'Anonymous',
      userId: user?.id,
      productId: params.id
    };

    try {
      // Here you would typically make an API call to submit the review
      const newReview = {
        id: Date.now().toString(),
        name: user?.name || 'You',
        text: reviewData.comment,
        rating: reviewData.rating,
        date: new Date().toISOString()
      };
      
      setReviews(prev => [newReview, ...prev]);
      setShowReviewModal(false);
      
      // Reset form
      e.target.reset();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/70">Loading product...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl text-red-500 mb-4">Error loading product</p>
            <p className="text-foreground/70">{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
                {product.compare_price && (
                  <span className="text-xl text-foreground/50 line-through">${product.compare_price}</span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐ {product.rating || '4.5'}</span>
                  <span className="text-foreground/70">({reviews.length} reviews)</span>
                </div>
              </div>

              <p className="text-foreground/70 mb-4 leading-relaxed">
                {product.description || product.short_description}
              </p>

              {/* Product Details */}
              <div className="space-y-2 mb-6 text-sm text-foreground/60">
                {product.material && (
                  <p><strong>Material:</strong> {product.material}</p>
                )}
                {product.dimensions && (
                  <p><strong>Dimensions:</strong> {product.dimensions.join(', ')}</p>
                )}
                {product.weight && (
                  <p><strong>Weight:</strong> {product.weight}</p>
                )}
                <p><strong>Stock:</strong> {product.stock_quantity || 'In Stock'}</p>
              </div>

              {/* Options */}
              <div className="space-y-6 mb-8">
                {/* Color */}
                {product.color && product.color.length > 0 && (
                  <div>
                    <label className="block font-semibold mb-3">Color</label>
                    <div className="flex gap-3">
                      {product.color.map(color => (
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
                )}

                {/* Size/Dimensions */}
                {product.dimensions && product.dimensions.length > 0 && (
                  <div>
                    <label className="block font-semibold mb-3">Size</label>
                    <div className="flex gap-3">
                      {product.dimensions.map(size => (
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
                )}

                {/* Quantity */}
                <div>
                  <label className="block font-semibold mb-3">Quantity</label>
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-accent rounded-lg hover:bg-primary/10 transition"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 bg-accent rounded-lg hover:bg-primary/10 transition"
                      disabled={quantity >= (product.stock_quantity || 10)}
                    >
                      +
                    </button>
                  </div>
                  {product.stock_quantity && (
                    <p className="text-sm text-foreground/60 mt-2">
                      {product.stock_quantity} items available
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!product.stock_quantity || product.stock_quantity === 0}
                  className="flex-1 py-4 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!product.stock_quantity || product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToWishlist}
                  className="flex-1 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition"
                >
                  Add to Wishlist ❤️
                </motion.button>
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

            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-foreground/60">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, idx) => (
                  <div key={review.id || idx} className="border-t border-border pt-6 first:border-t-0 first:pt-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{review.name}</h4>
                        {review.date && (
                          <p className="text-sm text-foreground/60">
                            {new Date(review.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className="text-yellow-400 text-lg">
                        {'⭐'.repeat(review.rating)}
                      </span>
                    </div>
                    <p className="text-foreground/70 leading-relaxed">{review.text || review.comment}</p>
                  </div>
                ))}
              </div>
            )}

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
                        className="w-full px-4 py-2 bg-accent rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        required
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
                        placeholder="Share your experience with this product..."
                        minLength="10"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
                      >
                        Submit Review
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