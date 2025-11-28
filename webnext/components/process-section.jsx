'use client';

import { motion } from 'framer-motion';
import { Search, ShoppingCart, Truck, Star } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'Browse Collection',
    description: 'Explore our wide range of premium furniture',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: ShoppingCart,
    title: 'Add to Cart',
    description: 'Select your favorite items and add them to cart',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Get your furniture delivered within 3-5 days',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Star,
    title: 'Enjoy Quality',
    description: 'Experience premium comfort and style',
    color: 'from-green-500 to-emerald-500'
  }
];

export default function ProcessSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
            Simple steps to transform your space with our premium furniture
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-primary/20 hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative"
              >
                {/* Step Number */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold z-10 border-4 border-white">
                  {index + 1}
                </div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                >
                  <step.icon className="w-10 h-10 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-foreground/60">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}