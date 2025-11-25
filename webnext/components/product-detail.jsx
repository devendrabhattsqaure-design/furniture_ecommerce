// components/product-detail.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  Star,
  Minus,
  Plus,
  Package,
  ChevronRight,
  Home,
  Sparkles,
  Award,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { addToCart, addToCartAPI } from '@/redux/slices/cartSlice.js';
import { getProductById } from '@/redux/slices/productSlice.js';

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const dispatch = useAppDispatch();
  const { 
    selectedProduct: product, 
    loading, 
    error 
  } = useAppSelector(state => state.products);
  
  const { isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (productId) {
      dispatch(getProductById(productId));
    }
  }, [dispatch, productId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      dispatch(addToCart({
        id: product.product_id,
        name: product.product_name,
        price: product.price,
        image: product.images?.[0]?.image_url || "/placeholder.svg",
        quantity: quantity
      }));
      return;
    }

    try {
      await dispatch(addToCartAPI({
        product_id: product.product_id,
        quantity: quantity
      })).unwrap();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            </div>
            <p className="text-gray-600 mt-4 font-medium">Loading product details...</p>
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => dispatch(getProductById(productId))}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition"
            >
              Try Again
            </button>
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = product.images || [];
  const mainImage = images[selectedImage]?.image_url || "/placeholder.svg";
  const discount = product.compare_price && product.compare_price > product.price 
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) 
    : 0;

  return (
    <>
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Home className="w-4 h-4" />
            <ChevronRight className="w-4 h-4" />
            <span>{product.category_name || 'Products'}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate">{product.product_name}</span>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          >
            {/* Product Images Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg relative group">
                <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <motion.img
                    key={selectedImage}
                    src={mainImage}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                </div>
                
                {/* Wishlist & Share Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition"
                  >
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </motion.button>
                </div>

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-lg shadow-lg font-bold flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {discount}% OFF
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {images.map((image, index) => (
                    <motion.button
                      key={image.image_id || index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                      className={`bg-white rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-primary shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`${product.product_name} ${index + 1}`}
                        className="w-full aspect-square object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.is_featured && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Featured
                  </span>
                )}
                {product.is_bestseller && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Bestseller
                  </span>
                )}
                {product.is_new_arrival && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    New Arrival
                  </span>
                )}
              </div>

              {/* Product Name */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {product.product_name}
                </h1>
                {product.category_name && (
                  <p className="text-gray-600">
                    in <span className="text-primary font-medium">{product.category_name}</span>
                  </p>
                )}
              </div>

              {/* Rating & SKU */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">4.5</span>
                  <span className="text-sm text-gray-500">(127 reviews)</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-gray-600">SKU: <span className="font-medium">{product.sku}</span></span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{product.price}
                  </span>
                  {product.compare_price && product.compare_price > product.price && (
                    <span className="text-xl text-gray-400 line-through">
                      ₹{product.compare_price}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                    <Sparkles className="w-4 h-4" />
                    You save ₹{(product.compare_price - product.price).toFixed(2)} ({discount}%)
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className={`flex items-center gap-2 text-sm font-medium ${
                product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  product.stock_quantity > 0 ? 'bg-green-600' : 'bg-red-600'
                }`} />
                {product.stock_quantity > 0 
                  ? `In Stock - ${product.stock_quantity} available`
                  : 'Out of Stock'
                }
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-gray-700 text-base leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Product Specifications */}
              {(product.material || product.color || product.dimensions || product.weight) && (
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {product.material && (
                      <div>
                        <span className="text-gray-600 text-sm block">Material</span>
                        <p className="text-gray-900 font-medium">{product.material}</p>
                      </div>
                    )}
                    {product.color && (
                      <div>
                        <span className="text-gray-600 text-sm block">Color</span>
                        <p className="text-gray-900 font-medium">{product.color}</p>
                      </div>
                    )}
                    {product.dimensions && (
                      <div>
                        <span className="text-gray-600 text-sm block">Dimensions</span>
                        <p className="text-gray-900 font-medium">{product.dimensions}</p>
                      </div>
                    )}
                    {product.weight && (
                      <div>
                        <span className="text-gray-600 text-sm block">Weight</span>
                        <p className="text-gray-900 font-medium">{product.weight} kg</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-2 font-semibold text-gray-900 border-x-2 border-gray-200 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= (product.stock_quantity || 10)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!product.stock_quantity || product.stock_quantity === 0}
                  className="flex-1 py-4 bg-gradient-to-r from-primary to-primary text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {!product.stock_quantity || product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </motion.button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">Free Delivery</p>
                  <p className="text-xs text-gray-500">On orders over ₹500</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-500">100% protected</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <RotateCcw className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">Easy Returns</p>
                  <p className="text-xs text-gray-500">30-day policy</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Product Description */}
          {product.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-md"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                Product Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                  {product.description}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  );
}