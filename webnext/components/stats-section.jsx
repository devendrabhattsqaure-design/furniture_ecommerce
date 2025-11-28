'use client';

import { motion } from 'framer-motion';
import { Users, Truck, Award, Heart } from 'lucide-react';

const STATS = [
  { icon: Users, value: '50K+', label: 'Happy Customers', color: 'from-blue-500 to-cyan-500' },
  { icon: Truck, value: '500+', label: 'Orders Delivered', color: 'from-green-500 to-emerald-500' },
  { icon: Award, value: '15+', label: 'Awards Won', color: 'from-purple-500 to-pink-500' },
  { icon: Heart, value: '98%', label: 'Customer Satisfaction', color: 'from-red-500 to-orange-500' }
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary/90 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-white">Our Store</span>
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            We're committed to providing the best furniture shopping experience with quality products and exceptional service
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
              >
                <stat.icon className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="text-4xl font-bold mb-2"
              >
                {stat.value}
              </motion.div>
              
              <p className="text-white/80 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}