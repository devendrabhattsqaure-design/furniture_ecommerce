'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTABanner() {
  return (
    <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
      
      {/* Background Glow */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-primary/20 blur-[150px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="
            text-center p-10 md:p-16 rounded-3xl
            backdrop-blur-xl bg-white/10 border border-white/20
            shadow-[0px_0px_40px_rgba(0,0,0,0.15)]
          "
        >
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
          >
            Ready to Transform Your Space?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Discover beautifully crafted premium furniture pieces that elevate comfort, style, and elegance — all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/shop"
              className="
                px-10 py-4 bg-primary text-white rounded-xl text-lg font-semibold
                shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300
              "
            >
              Shop Now
            </Link>

            <Link
              href="/about"
              className="
                px-10 py-4 border-2 border-primary text-primary rounded-xl text-lg font-semibold
                hover:bg-primary/10 hover:scale-105 transition-all duration-300
              "
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
