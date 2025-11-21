// components/product-detail.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { addToCart } from '@/redux/slices/cartSlice.js';
import { getProductById } from '@/redux/slices/productSlice.js';

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const dispatch = useAppDispatch();
  const { 
    selectedProduct: product, 
    loading, 
    error 
  } = useAppSelector(state => state.products);

  console.log('Product Detail Debug:', {
    productId,
    product,
    loading,
    error,
    hasImages: product?.images?.length,
    imageData: product?.images
  });

  useEffect(() => {
    if (productId) {
      console.log('Dispatching getProductById with ID:', productId);
      dispatch(getProductById(productId));
    }
  }, [dispatch, productId]);

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
            <button 
              onClick={() => dispatch(getProductById(productId))}
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Retry
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
          {/* Debug Info - Remove in production */}
          <div className="bg-yellow-100 p-4 rounded mb-4 text-sm">
            <strong>Debug Info:</strong> Product ID: {product.product_id}, 
            Images: {images.length}, 
            Has Data: {product ? 'Yes' : 'No'}
          </div>

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
                  onError={(e) => {
                    e.target.src = "/placeholder.svg";
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <button
                      key={image.image_id || index}
                      onClick={() => setSelectedImage(index)}
                      className={`bg-accent rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`${product.product_name} ${index + 1}`}
                        className="w-full h-20 object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
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

              {/* Add to Cart Button */}
              <div className="pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!product.stock_quantity || product.stock_quantity === 0}
                  className="w-full py-4 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!product.stock_quantity || product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
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
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line ">
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