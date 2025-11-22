'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-foreground/70">We'd love to hear from you</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Form */}
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="bg-accent rounded-2xl p-8 space-y-4"
            >
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows="6"
                className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <button
                type="submit"
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
              >
                Send Message
              </button>
            </motion.form>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {[
                { icon: '📍', title: 'Address', content: '123 Design Street, NY 10001' },
                { icon: '📞', title: 'Phone', content: '+1 (555) 123-4567' },
                { icon: '📧', title: 'Email', content: 'hello@Luxury Furniture.com' },
                { icon: '🕐', title: 'Hours', content: 'Mon-Fri: 9AM-6PM EST' },
              ].map((item, idx) => (
                <div key={idx}>
                  <h3 className="text-2xl mb-2">{item.icon}</h3>
                  <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                  <p className="text-foreground/70">{item.content}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
