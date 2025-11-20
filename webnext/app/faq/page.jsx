'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: 'What is your shipping policy?',
      a: 'We offer free shipping on orders over $100. Standard shipping takes 5-7 business days.',
    },
    {
      q: 'Do you have a return policy?',
      a: 'Yes, we offer 30-day returns for all products in original condition.',
    },
    {
      q: 'Are your products sustainable?',
      a: 'We use eco-friendly materials and ethical production methods in all our furniture.',
    },
    {
      q: 'How do I track my order?',
      a: 'You will receive a tracking number via email once your order ships.',
    },
    {
      q: 'Can I customize furniture?',
      a: 'Yes, we offer customization for select furniture pieces. Contact us for details.',
    },
    {
      q: 'What warranty do you offer?',
      a: 'All furniture comes with a 5-year structural warranty.',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-foreground/70">Find answers to common questions</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full text-left p-6 bg-accent rounded-2xl hover:bg-primary/5 transition"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg pr-4">{faq.q}</h3>
                    <span className={`text-primary text-2xl transition transform ${
                      openIdx === idx ? 'rotate-180' : ''
                    }`}>
                      ↓
                    </span>
                  </div>

                  <AnimatePresence>
                    {openIdx === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-foreground/70 mt-4 pt-4 border-t border-border">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
