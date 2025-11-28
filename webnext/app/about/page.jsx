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
      title: 'Premium Quality', 
      desc: 'Premium quality materials combined with durable and long-lasting builds',
      color: 'text-red-500'
    },
    { 
      icon: Palette, 
      title: 'Modern Design', 
      desc: 'Elegant and modern designs that enhance every space beautifully',
      color: 'text-red-500'
    },
    { 
      icon: Lightbulb, 
      title: 'Custom Solutions', 
      desc: 'Tailored furniture solutions designed for your specific needs',
      color: 'text-red-500'
    },
    { 
      icon: Heart, 
      title: 'Customer First', 
      desc: 'On-time delivery, professional installation, and customer-first approach',
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
                <span className="text-sm font-medium text-gray-700">Where Craftsmanship Meets Strength</span>
              </motion.div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                About OakEmpire
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Where craftsmanship meets strength, style, and lasting value. Furniture that stands strong for years—just like the mighty oak tree.
              </p>
              
              {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex justify-center"
              >
                <ChevronDown className="w-6 h-6 animate-bounce text-gray-600" />
              </motion.div> */}
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
                  Who We Are
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    Founded by <span className="font-semibold">Akshat Bhatt</span>, OakEmpire was built with a vision to create 
                    furniture that stands strong for years—just like the mighty oak tree. At OakEmpire Furniture, we combine 
                    modern design with unmatched durability.
                  </p>
                  <p className="text-lg leading-relaxed">
                    The name <span className="font-semibold">"OakEmpire"</span> carries deep purpose: <span className="font-semibold">Oak</span> symbolizes 
                    strength, durability, and timeless elegance—the king of hardwoods trusted for centuries. <span className="font-semibold">Empire</span> represents 
                    growth, scale, leadership, and excellence—the legacy we aim to build.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Our goal is to transform living and working spaces with furniture that is stylish, functional, and built to last. 
                    Every piece is thoughtfully designed, precisely crafted, and quality-approved to meet the highest industry standards.
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
                Our Promise
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The commitment that drives every piece we create and every customer we serve
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

        {/* What We Do Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-4">What We Do</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Comprehensive furniture solutions for offices and homes
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-6 flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-3xl mb-4">🪑 Office Modular Furniture</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  High-performance modular office solutions focused on productivity, space efficiency, comfort, and modern design:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Workstations & cubicles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Executive and managerial tables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Reception setups & conference tables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Storage units & customized layouts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Ergonomic seating solutions</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-6 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-3xl mb-4">🏡 Complete Home Furniture</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Full range of premium home furniture bringing style and comfort to your living spaces:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Bedroom sets & wardrobes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Modular kitchens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Living room furniture & sofa sets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Dining tables & chairs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>TV units & customized wooden furniture</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision & Mission Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-10 rounded-2xl bg-gradient-to-br from-red-50 to-gray-100 border border-gray-200"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-6 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-800">Our Vision</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  To become India's most trusted brand for modular and wooden furniture by creating products 
                  that combine strength, design, and functionality.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-10 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white border border-gray-700"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-6 flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  To deliver stylish, durable, and affordable furniture that enhances the spaces where people 
                  live and work—crafted with integrity and built to last.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}