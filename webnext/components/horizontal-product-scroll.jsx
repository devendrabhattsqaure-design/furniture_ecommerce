'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';

const PRODUCTS = [
  {
    id: 1,
    name: 'Modern Velvet Sofa',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 124,
    isNew: true
  },
  {
    id: 2,
    name: 'Minimalist Coffee Table',
    price: 299,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 89,
    isOnSale: true
  },
  {
    id: 3,
    name: 'Ergonomic Office Chair',
    price: 599,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 156,
    isBestSeller: true
  },
  {
    id: 4,
    name: 'Luxury King Bed',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 203
  },
  {
    id: 5,
    name: 'Designer Dining Table',
    price: 899,
    image: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=400&h=400&fit=crop',
    rating: 4.5,
    reviews: 67
  },
  {
    id: 6,
    name: 'Smart Storage Cabinet',
    price: 499,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',
    rating: 4.4,
    reviews: 98
  }
];

export default function HorizontalProductScroll({ title, subtitle }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-accent/20 to-background">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
            <p className="text-foreground/60">{subtitle}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-2 -mx-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {PRODUCTS.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="flex-none w-80 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {product.isNew && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        NEW
                      </span>
                    )}
                    {product.isOnSale && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        SALE
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                        BESTSELLER
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{product.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                    </div>
                    <span className="text-gray-500 text-sm">({product.reviews} reviews)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">${product.price}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}