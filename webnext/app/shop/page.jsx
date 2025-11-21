// app/shop/page.jsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';
import ProductCard from '@/components/product-card.jsx';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { getProducts } from '@/redux/slices/productSlice.js';
import { getCategories } from '@/redux/slices/categorySlice.js';

// Price ranges for filtering
const PRICE_RANGES = [
  { min: 0, max: 1000, label: 'Under ₹1,000' },
  { min: 1000, max: 5000, label: '₹1,000 - ₹5,000' },
  { min: 5000, max: 10000, label: '₹5,000 - ₹10,000' },
  { min: 10000, max: 50000, label: 'Over ₹10,000' },
];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { 
    products, 
    loading: productsLoading, 
    error: productsError,
    pagination 
  } = useAppSelector(state => state.products);
  
  const { 
    categories, 
    loading: categoriesLoading 
  } = useAppSelector(state => state.categories);

  // Fetch categories and products on component mount (every visit)
  useEffect(() => {
    console.log('ShopPage mounted/visited, fetching data...');
    
    const fetchInitialData = async () => {
      try {
        // Fetch categories first
        await dispatch(getCategories());
        
        // Build initial filters
        const filters = {};
        const categoryFromParams = searchParams.get('category');
        const searchFromParams = searchParams.get('search');
        
        if (categoryFromParams) {
          filters.category_id = categoryFromParams;
          setSelectedCategory(categoryFromParams);
        }
        
        if (searchFromParams) {
          filters.search = searchFromParams;
          setSearchQuery(searchFromParams);
        }
        
        // Fetch products with filters
        await dispatch(getProducts(filters));
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setIsInitialLoad(false);
      }
    };

    fetchInitialData();
    
    // Reset scroll position when page loads
    window.scrollTo(0, 0);
  }, []); // Empty dependency ensures this runs on every mount

  // Fetch products when filters change (but skip initial load)
  useEffect(() => {
    if (isInitialLoad) return;

    console.log('Filters changed, fetching products...');
    
    const filters = {};
    
    if (selectedCategory !== 'all') {
      filters.category_id = selectedCategory;
    }
    
    if (priceRange[0] > 0 || priceRange[1] < 50000) {
      filters.min_price = priceRange[0];
      filters.max_price = priceRange[1];
    }
    
    if (searchQuery) {
      filters.search = searchQuery;
    }

    dispatch(getProducts(filters));
  }, [selectedCategory, priceRange, searchQuery, isInitialLoad, dispatch]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    let filtered = [...products];

    // Apply sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'featured') {
      filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  }, [products, sortBy]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange([min, max]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled in the useEffect
  };

  // Add loading state for initial page load
  if (isInitialLoad && productsLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-foreground/70">Loading shop...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-accent py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">Shop Our Collection</h1>
            <p className="text-foreground/70 text-lg">Find your perfect furniture pieces</p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-6 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                >
                  🔍
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Filters & Products */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Category Filter */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value="all"
                        checked={selectedCategory === 'all'}
                        onChange={() => handleCategoryChange('all')}
                        className="w-4 h-4 accent-primary"
                      />
                      <span>All Categories</span>
                    </label>
                    
                    {categoriesLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      categories.map(category => (
                        <label key={category.category_id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value={category.category_id}
                            checked={selectedCategory === category.category_id.toString()}
                            onChange={() => handleCategoryChange(category.category_id.toString())}
                            className="w-4 h-4 accent-primary"
                          />
                          <span>{category.category_name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Price Range</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange[0] === 0 && priceRange[1] === 50000}
                        onChange={() => handlePriceRangeChange(0, 50000)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span>All Prices</span>
                    </label>
                    
                    {PRICE_RANGES.map((range, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange[0] === range.min && priceRange[1] === range.max}
                          onChange={() => handlePriceRangeChange(range.min, range.max)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span>{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Products */}
            <div className="md:col-span-3">
              {/* Sort and Results */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-foreground/70">
                    {productsLoading ? 'Loading...' : `Showing ${filteredAndSortedProducts.length} products`}
                  </p>
                  {pagination && (
                    <p className="text-sm text-foreground/60">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                  )}
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-accent rounded-lg border border-border focus:outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* Error Message */}
              {productsError && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                  Error loading products: {productsError}
                </div>
              )}

              {/* Products Grid */}
              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-accent rounded-lg p-4 animate-pulse">
                      <div className="h-48 bg-gray-300 rounded mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredAndSortedProducts.map((product) => (
                    <motion.div
                      key={product.product_id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ProductCard 
                        id={product.product_id}
                        name={product.product_name}
                        price={product.price}
                        compare_price={product.compare_price}
                        image={product.images?.[0]?.image_url || '/placeholder.svg'}
                        rating={product.rating || 4.5}
                        is_featured={product.is_featured}
                        is_on_sale={product.is_on_sale}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* No Products Message */}
              {!productsLoading && filteredAndSortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-foreground/70 text-lg">No products found</p>
                  <p className="text-foreground/60 mt-2">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}