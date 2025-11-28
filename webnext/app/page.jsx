'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';
import {  Package, Shield, Sparkles, Star, ArrowRight, Zap } from 'lucide-react';

const Footer = dynamic(() => import('@/components/footer.jsx'));
const Newsletter = dynamic(() => import('@/components/newsletter.jsx'));
const CTABanner = dynamic(() => import('@/components/cta-banner.jsx'));
const TestimonialSlider = dynamic(() => import('@/components/testimonial-slider.jsx'));
const ProductCard = dynamic(() => import('@/components/product-card.jsx'));
const ScrollReveal = dynamic(() => import('@/components/scroll-reveal.jsx'), { ssr: false });

// Import the new components
const CategoryShowcase = dynamic(() => import('@/components/category-showcase.jsx'));
const HorizontalProductScroll = dynamic(() => import('@/components/horizontal-product-scroll.jsx'));
const StatsSection = dynamic(() => import('@/components/stats-section.jsx'));
const ProcessSection = dynamic(() => import('@/components/process-section.jsx'));

import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { getProducts } from '@/redux/slices/productSlice.js';
const  Particles = dynamic(()=> import('@/components/Particles.jsx'), { ssr: false });
import { 
  fetchUserProfile, 
} from '@/redux/slices/userSlice';
import { 
  fetchAddresses, 
} from '@/redux/slices/addressSlice';

const BANNER_SLIDES = [
  {
    id: 1,
    title: 'Modern Living',
    subtitle: 'Transform Your Space',
    description: 'Discover premium furniture that defines contemporary elegance',
    image: 'https://media.designcafe.com/wp-content/uploads/2021/10/01210721/modern-luxury-bedroom-furniture.jpg',
    cta: 'Shop Now',
    bg: 'from-purple-600/20 via-pink-500/20 to-rose-500/20'
  },
  {
    id: 2,
    title: 'Timeless Design',
    subtitle: 'Crafted to Perfection',
    description: 'Experience the finest materials and exceptional craftsmanship',
    image: 'https://woodenbazar.com/cdn/shop/files/Hela_3_-_Piece_Velvet_Living_Room_Set_6109e5cf-4080-4c08-ad22-72f7103c0831.webp?v=1757461505',
    cta: 'Explore',
    bg: 'from-blue-600/20 via-cyan-500/20 to-teal-500/20'
  },
  {
    id: 3,
    title: 'Luxury Comfort',
    subtitle: 'Live in Style',
    description: 'Elevate every moment with furniture that speaks to your soul',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop',
    cta: 'Discover',
    bg: 'from-amber-600/20 via-orange-500/20 to-red-500/20'
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const { scrollYProgress } = useScroll();
  const router = useRouter();
  const { user, isAuthenticated, loading: userLoading, error: userError } = useAppSelector(state => state.user);

  const dispatch = useAppDispatch();
  const { 
    products, 
    loading: productsLoading, 
    error: productsError 
  } = useAppSelector(state => state.products);

  // All hooks must be called unconditionally at the top level
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y = useTransform(smoothProgress, [0, 1], [0, -500]);
  const opacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.5], [1, 0.8]);
  const rotateX = useTransform(smoothProgress, [0, 0.5], [0, 25]);
  
  // This was the problematic hook - move it to top level
  const parallaxY = useTransform(smoothProgress, [0.1, 0.3], [100, -100]);

  // Set mounted state and trigger initial load
  useEffect(() => {
    setMounted(true);
    
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);
 
  useEffect(() => {
    if (mounted) {
      console.log('Home page mounted, checking authentication...');
      
      console.log('User is authenticated, loading data...');
      
      const loadData = async () => {
        try {
          await dispatch(fetchUserProfile()).unwrap();
          await dispatch(fetchAddresses()).unwrap();
        } catch (error) {
          console.log('Failed to load data:', error);
          if (error.message.includes('401') || error.message.includes('token')) {
            localStorage.removeItem('token');
            router.push('/login');
          }
        }
      };
      
      loadData();
    }
  }, [isAuthenticated, router, dispatch, mounted]);

  // Fetch featured products on mount
  useEffect(() => {
    if (mounted) {
      console.log('Home page mounted, fetching featured products...');
      
      const fetchFeaturedProducts = async () => {
        try {
          await dispatch(getProducts({ is_featured: true, limit: 6 }));
          setIsInitialLoad(false);
        } catch (error) {
          console.error('Error fetching products:', error);
          setIsInitialLoad(false);
        }
      };

      fetchFeaturedProducts();
    }
  }, [mounted, dispatch]);

  // Auto slide effect
  useEffect(() => {
    if (!mounted) return;
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % BANNER_SLIDES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [mounted]);

  // Reset scroll position on mount
  useEffect(() => {
    if (mounted) {
      const timeout = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [mounted]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);

  const featuredProducts = products?.filter(product => product.is_featured) || [];

  
  if (!mounted || !pageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading Luxury Furniture...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Banner Slider */}
      <section className="relative h-[90vh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Animated Background Particles */}
        <motion.div 
          style={{ y, opacity }} 
          className="absolute inset-0 z-0"
          initial={false}
          animate={{ opacity: 1 }}
        >
          <Particles />
        </motion.div>

        {/* Slides */}
        {BANNER_SLIDES.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentSlide === index ? 1 : 0,
              scale: currentSlide === index ? 1 : 1.1,
              zIndex: currentSlide === index ? 1 : 0
            }}
            transition={{ duration: 0.7 }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />
            
            {/* Background Image */}
            <motion.img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1.2 }}
              animate={{ scale: currentSlide === index ? 1 : 1.2 }}
              transition={{ duration: 7 }}
            />

            {/* Content */}
            <div className="relative z-20 h-full flex items-center">
              <div className="max-w-6xl mx-auto px-4 w-full">
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{
                    x: currentSlide === index ? 0 : -100,
                    opacity: currentSlide === index ? 1 : 0
                  }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-2xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: currentSlide === index ? 1 : 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm font-medium">{slide.subtitle}</span>
                  </motion.div>

                  <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white leading-tight">
                    {slide.title.split(' ').map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{
                          y: currentSlide === index ? 0 : 100,
                          opacity: currentSlide === index ? 1 : 0
                        }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                        className="inline-block mr-4"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </h1>

                  <motion.p
                    initial={{ y: 50, opacity: 0 }}
                    animate={{
                      y: currentSlide === index ? 0 : 50,
                      opacity: currentSlide === index ? 1 : 0
                    }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-xl text-white/80 mb-8 leading-relaxed"
                  >
                    {slide.description}
                  </motion.p>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: currentSlide === index ? 1 : 0.8,
                      opacity: currentSlide === index ? 1 : 0
                    }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <motion.a
                      whileHover={{ scale: 1.05, x: 10 }}
                      whileTap={{ scale: 0.95 }}
                      href="/shop"
                      className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-white/20 transition-all group"
                    >
                      {slide.cta}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {BANNER_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="relative h-2 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: currentSlide === index ? '48px' : '32px' }}
            >
              <div className="absolute inset-0 bg-white/30" />
              {currentSlide === index && (
                <motion.div
                  layoutId="activeSlide"
                  className="absolute inset-0 bg-white"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      {/* <StatsSection /> */}

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Featured Products Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-accent/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full mb-6"
            >
              <Star className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">Featured Collection</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Handpicked <span className="text-primary">Just For You</span>
            </h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
              Discover our carefully curated selection of premium furniture that combines style, comfort, and durability
            </p>
          </motion.div>

          {/* Products Grid */}
          {productsLoading && isInitialLoad ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-accent rounded-2xl p-6 animate-pulse">
                  <div className="h-64 bg-gray-300 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.product_id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -8 }}
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
                    is_bestseller={product.is_bestseller}
                    is_new_arrival={product.is_new_arrival}
                    stock_quantity={product.stock_quantity}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* No Products Message */}
          {!productsLoading && featuredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-foreground/70 text-lg">No featured products found</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/shop"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary to-primary text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all group"
            >
              View All Products
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Best Sellers Horizontal Scroll */}
      <HorizontalProductScroll 
        title="Best Sellers" 
        subtitle="Most loved by our customers" 
      />

      {/* 3D Parallax Features Section */}
      <section className="py-20 px-4 bg-background relative overflow-hidden">
        <motion.div
          style={{ y: parallaxY }}
          className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            style={{ scale, rotateX }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000"
          >
            {[
              { Icon: Package, title: 'Free Shipping', desc: 'On orders over ₹1000', color: 'from-blue-500 to-cyan-500' },
              { Icon: Sparkles, title: 'Premium Quality', desc: 'Carefully curated selection', color: 'from-purple-500 to-pink-500' },
              { Icon: Shield, title: 'Guaranteed Safe', desc: '100% secure checkout', color: 'from-orange-500 to-red-500' },
            ].map((feature, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1}>
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 10,
                    z: 50
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative p-8 bg-gradient-to-br from-accent to-accent/50 rounded-3xl overflow-hidden group cursor-pointer border border-gray-200"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <feature.Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="font-bold text-2xl mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-foreground/60">{feature.desc}</p>
                  
                  <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500"
                  />
                </motion.div>
              </ScrollReveal>
            ))}
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Horizontal Scroll */}
      <HorizontalProductScroll 
        title="New Arrivals" 
        subtitle="Fresh additions to our collection" 
      />

      {/* Process Section */}
      <ProcessSection />

      <TestimonialSlider />
      <CTABanner />
      <Newsletter />
      <Footer />
    </>
  );
}