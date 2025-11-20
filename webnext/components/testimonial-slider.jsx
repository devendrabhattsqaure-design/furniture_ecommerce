'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TESTIMONIALS } from '@/lib/constants.js';

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/40">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-14 tracking-tight"
        >
          What Our Customers Say
        </motion.h2>

        <div className="relative h-72 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -40 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="
                backdrop-blur-xl bg-white/10 border border-white/20
                shadow-xl p-10 rounded-3xl max-w-3xl mx-auto text-center
                flex flex-col items-center space-y-5
              "
            >
              {/* Avatar */}
              <div className="
                w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center
                shadow-md text-3xl
              ">
                👤
              </div>

              <p className="text-lg md:text-xl italic text-foreground/90 leading-relaxed">
                “{TESTIMONIALS[current].content}”
              </p>

              <div className="flex flex-col items-center">
                <h4 className="text-xl font-semibold">{TESTIMONIALS[current].name}</h4>
                <p className="text-sm text-foreground/60">{TESTIMONIALS[current].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-10">
          {TESTIMONIALS.map((_, idx) => (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`
                h-3 rounded-full transition-all
                ${idx === current ? 'w-10 bg-primary' : 'w-3 bg-foreground/20'}
              `}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
