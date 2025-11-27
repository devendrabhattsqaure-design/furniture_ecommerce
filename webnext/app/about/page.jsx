'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  Target, 
  Leaf, 
  Lightbulb, 
  Heart, 
  Users, 
  Package, 
  Palette, 
  Award,
  Sparkles,
  ChevronDown,
  Crown,
  Shield,
  Truck
} from 'lucide-react';

const Footer = dynamic(() => import('@/components/footer.jsx'));

export default function AboutPage() {
  const values = [
    { 
      icon: Target, 
      title: 'Quality', 
      desc: 'Premium materials and craftsmanship with lifetime warranty',
      color: 'text-red-500'
    },
    { 
      icon: Leaf, 
      title: 'Sustainability', 
      desc: 'Eco-friendly production and responsibly sourced materials',
      color: 'text-red-500'
    },
    { 
      icon: Lightbulb, 
      title: 'Innovation', 
      desc: 'Modern designs with timeless appeal and smart features',
      color: 'text-red-500'
    },
    { 
      icon: Heart, 
      title: 'Customer First', 
      desc: 'Your satisfaction is our top priority with 24/7 support',
      color: 'text-red-500'
    },
  ];

  const stats = [
    { icon: Users, number: '10k+', label: 'Happy Customers' },
    { icon: Package, number: '500+', label: 'Products' },
    { icon: Palette, number: '50+', label: 'Designers' },
    { icon: Award, number: '100%', label: 'Satisfaction' },
  ];

  const features = [
    { icon: Shield, text: '5-Year Warranty' },
    { icon: Truck, text: 'Free Shipping' },
    { icon: Crown, text: 'Premium Materials' },
    { icon: Sparkles, text: 'Custom Designs' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Enhanced Hero Section */}
        <section className="relative py-28 px-4 bg-gradient-to-br from-red-500/10 to-gray-100 text-gray-800 overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 mb-6"
              >
                <Crown className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-700">Premium Furniture Since 2015</span>
              </motion.div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                About Luxury
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Crafting exceptional furniture that transforms living spaces into sanctuaries of comfort, style, and sophistication.
              </p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex justify-center"
              >
                <ChevronDown className="w-6 h-6 animate-bounce text-gray-600" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Our Story
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    Founded in 2015, Luxury Furniture began with a simple yet powerful vision: to bring premium, 
                    designer-quality furniture within reach of discerning homeowners. What started as a small 
                    artisan workshop has blossomed into a trusted name in luxury home furnishings.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Our journey is built on passion, craftsmanship, and an unwavering commitment to excellence. 
                    Every piece in our collection tells a story of meticulous attention to detail and timeless design.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Today, we partner with the world's most talented designers and craftsmen to curate an exclusive 
                    collection that combines exceptional quality with contemporary aesthetics, creating heirlooms 
                    for the modern home.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                className="relative"
              >
                <div className="bg-gradient-to-br from-red-50 to-gray-100 rounded-2xl p-8 h-96 flex items-center justify-center border border-gray-200">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-800">
                      Crafting Dreams into Reality
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                Our Values
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide every piece we create and every customer we serve
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                  className="group text-center p-8 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-gray-50 group-hover:scale-110 transition-transform duration-300 mb-6 border border-gray-100`}>
                    <value.icon className={`w-8 h-8 ${value.color}`} />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-700 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-800 mb-2">{stat.number}</div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-gray-200"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <feature.icon className="w-5 h-5 text-red-500" />
                  <span className="font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                The passionate individuals behind our success story
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Devendra', role: 'Founder & CEO', bio: 'Visionary leader with 15+ years in luxury furniture design' },
                { name: 'Aman', role: 'Head of Design', bio: 'Award-winning designer passionate about sustainable luxury' },
                { name: 'Saurav', role: 'Head of Operations', bio: 'Ensuring seamless delivery of excellence worldwide' },
              ].map((member, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white/20">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl mb-2">{member.name}</h3>
                  <p className="text-red-300 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}