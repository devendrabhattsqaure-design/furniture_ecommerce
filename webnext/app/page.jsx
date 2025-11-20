'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Package, Shield, Sparkles, Star, ArrowRight, Zap } from 'lucide-react';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';
import ProductCard from '@/components/product-card.jsx';
import Newsletter from '@/components/newsletter.jsx';
import CTABanner from '@/components/cta-banner.jsx';
import TestimonialSlider from '@/components/testimonial-slider.jsx';
import ScrollReveal from '@/components/scroll-reveal.jsx';
import { FEATURED_PRODUCTS } from '@/lib/constants.js';

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
    image: '/luxury-furniture-sofa.jpg',
    cta: 'Discover',
    bg: 'from-amber-600/20 via-orange-500/20 to-red-500/20'
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollYProgress } = useScroll();
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y = useTransform(smoothProgress, [0, 1], [0, -500]);
  const opacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.5], [1, 0.8]);
  const rotateX = useTransform(smoothProgress, [0, 0.5], [0, 25]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <>
      <Navbar />
      
      {/* Banner Slider */}
<section className="relative h-[90vh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Animated Background Particles */}
        <motion.div
          style={{ y, opacity }}
          className="absolute inset-0 z-0"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `₹{Math.random() * 100}%`,
                top: `₹{Math.random() * 100}%`
              }}
            />
          ))}
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
            className={`absolute inset-0 bg-gradient-to-br ₹{slide.bg}`}
          >
            {/* Gradient Overlay */}
            <div className="absolute  inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />
            
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

        {/* Navigation Arrows */}
        {/* <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all group"
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all group"
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
        </button> */}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {BANNER_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="relative h-2 rounded-full overflow-hidden"
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

        {/* Scroll Indicator */}
        {/* <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-white/60 rounded-full mt-2"
            />
          </div>
        </motion.div> */}
      </section>

      {/* 3D Parallax Features Section */}
      <section className="py-24 px-4 bg-background relative overflow-hidden">
        <motion.div
          style={{ y: useTransform(smoothProgress, [0.1, 0.3], [100, -100]) }}
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
                  className="relative p-8 bg-gradient-to-br from-accent to-accent/50 rounded-3xl overflow-hidden group cursor-pointer"
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
                  
                  <h3 className="font-bold text-2xl mb-3">{feature.title}</h3>
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

      {/* Featured Products with Magnetic Effect */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-accent/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
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
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-primary">
              Handpicked Just For You
            </h2>
            <p className="text-foreground/60 text-xl max-w-2xl mx-auto">
              Discover our carefully curated selection of premium furniture
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {FEATURED_PRODUCTS.map((product, idx) => (
              <motion.div 
                key={product.id} 
                variants={itemVariants}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </motion.div>

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

      <TestimonialSlider />
      <CTABanner />
      <Newsletter />
      <Footer />
    </>
  );
}