'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 1,
    name: 'Living Room',
    description: 'Elegant sofas, coffee tables & entertainment units',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
    count: '45 Products',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 2,
    name: 'Bedroom',
    description: 'Luxury beds, wardrobes & nightstands',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&h=500&fit=crop',
    count: '32 Products',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 3,
    name: 'Dining',
    description: 'Stylish tables, chairs & storage solutions',
    image: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=500&h=500&fit=crop',
    count: '28 Products',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 4,
    name: 'Office',
    description: 'Ergonomic desks, chairs & bookcases',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&h=500&fit=crop',
    count: '24 Products',
    color: 'from-green-500 to-emerald-500'
  }
];

export default function CategoryShowcase() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Shop By <span className="text-primary">Category</span>
          </h2>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
            Explore our carefully curated collections for every room in your home
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-white/80 text-sm mb-3">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">{category.count}</span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-1 text-sm font-medium"
                  >
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>

              <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                {category.id}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}