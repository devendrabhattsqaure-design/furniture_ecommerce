// components/product-detail.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { addToCart } from '@/redux/slices/cartSlice.js';
import { addToWishlist } from '@/redux/slices/wishlistSlice.js';
import { getProductById } from '@/redux/slices/productSlice.js';

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
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
    if (productId) {
      dispatch(getProductById(productId));
    }
  }, [dispatch, productId]);

  useEffect(() => {
    if (product && product.reviews) {
      setReviews(product.reviews);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        id: product.product_id,
        name: product.product_name,
        price: product.price,
        image: product.images?.[0]?.image_url || "/placeholder.svg",
        quantity: quantity
      }));
    }
  };

  const handleAddToWishlist = () => {
    if (product) {
      dispatch(addToWishlist({
        id: product.product_id,
        name: product.product_name,
        price: product.price,
        image: product.images?.[0]?.image_url || "/placeholder.svg"
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
      productId: productId
    };

    try {
      const newReview = {
        id: Date.now().toString(),
        name: user?.name || 'You',
        text: reviewData.comment,
        rating: reviewData.rating,
        date: new Date().toISOString()
      };
      
      setReviews(prev => [newReview, ...prev]);
      setShowReviewModal(false);
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

  const images = product.images || [];
  const mainImage = images[selectedImage]?.image_url || "/placeholder.svg";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a href="/" className="text-foreground/60 hover:text-foreground">
                  Home
                </a>
              </li>
              <li className="flex items-center">
                <span className="text-foreground/30 mx-2">/</span>
                <a href="/shop" className="text-foreground/60 hover:text-foreground">
                  Products
                </a>
              </li>
              <li className="flex items-center">
                <span className="text-foreground/30 mx-2">/</span>
                <span className="text-foreground">{product.product_name}</span>
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12"
          >
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-accent rounded-2xl overflow-hidden h-96 flex items-center justify-center">
                <motion.img
                  key={selectedImage}
                  src={mainImage}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <button
                      key={image.image_id}
                      onClick={() => setSelectedImage(index)}
                      className={`bg-accent rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`${product.product_name} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.is_featured && (
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    Featured
                  </span>
                )}
                {product.is_bestseller && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Bestseller
                  </span>
                )}
                {product.is_new_arrival && (
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                    New Arrival
                  </span>
                )}
                {product.is_on_sale && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    On Sale
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-foreground">
                {product.product_name}
              </h1>

              {/* Category */}
              {product.category_name && (
                <p className="text-foreground/60">
                  Category: <span className="text-foreground">{product.category_name}</span>
                </p>
              )}

              {/* SKU */}
              <p className="text-foreground/60">
                SKU: <span className="text-foreground">{product.sku}</span>
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {'★'.repeat(4)}{'☆'.repeat(1)}
                </div>
                <span className="text-foreground/60">(4.5)</span>
                <span className="text-foreground/60">({reviews.length} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">
                  ${product.price}
                </span>
                {product.compare_price && product.compare_price > product.price && (
                  <>
                    <span className="text-xl text-foreground/50 line-through">
                      ${product.compare_price}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                      Save ${(product.compare_price - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className={`text-sm ${
                product.stock_quantity > 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {product.stock_quantity > 0 
                  ? `In Stock (${product.stock_quantity} available)`
                  : 'Out of Stock'
                }
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-foreground/70 text-lg leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Product Specifications */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-foreground/10">
                {product.material && (
                  <div>
                    <span className="text-foreground/60 block text-sm">Material:</span>
                    <p className="text-foreground">{product.material}</p>
                  </div>
                )}
                {product.color && (
                  <div>
                    <span className="text-foreground/60 block text-sm">Color:</span>
                    <p className="text-foreground">{product.color}</p>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <span className="text-foreground/60 block text-sm">Dimensions:</span>
                    <p className="text-foreground">{product.dimensions}</p>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <span className="text-foreground/60 block text-sm">Weight:</span>
                    <p className="text-foreground">{product.weight} kg</p>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-4 border-t border-foreground/10">
                <span className="text-foreground font-medium">Quantity:</span>
                <div className="flex items-center border border-foreground/20 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-foreground/60 hover:text-foreground disabled:opacity-30 transition"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 min-w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= (product.stock_quantity || 10)}
                    className="px-4 py-2 text-foreground/60 hover:text-foreground disabled:opacity-30 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart & Wishlist Buttons */}
              <div className="flex gap-4 pt-6">
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
                  Add to Wishlist
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Product Description */}
          {product.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-accent rounded-2xl p-8 mb-12"
            >
              <h2 className="text-2xl font-bold mb-4">Product Description</h2>
              <div className="prose max-w-none">
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </motion.div>
          )}

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