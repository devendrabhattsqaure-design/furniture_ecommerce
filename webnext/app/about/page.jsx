'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';

export default function AboutPage() {
  const values = [
    { icon: '🎯', title: 'Quality', desc: 'Premium materials and craftsmanship' },
    { icon: '🌿', title: 'Sustainability', desc: 'Eco-friendly production methods' },
    { icon: '💡', title: 'Innovation', desc: 'Modern designs with timeless appeal' },
    { icon: '❤️', title: 'Customer First', desc: 'Your satisfaction is our priority' },
  ];

  const stats = [
    { number: '10k+', label: 'Happy Customers' },
    { number: '500+', label: 'Products' },
    { number: '50+', label: 'Designers' },
    { number: '100%', label: 'Satisfaction' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-accent">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl font-bold mb-6">About Luxury Furniture</h1>
              <p className="text-xl text-foreground/70">
                Crafting luxury furniture that transforms living spaces into sanctuaries of comfort and style.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-lg text-foreground/70 mb-4 leading-relaxed">
                Founded in 2015, Luxury Furniture began with a simple vision: to bring premium, designer furniture within reach of everyone. What started as a small showroom has grown into a trusted name in luxury home furnishings.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                Today, we partner with the world's best designers to curate an exclusive collection that combines exceptional quality with contemporary aesthetics.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4 bg-accent">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-background"
                >
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                  <p className="text-foreground/70">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <p className="text-foreground/70">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 px-4 bg-accent">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Devendra', role: 'Founder & CEO' },
                { name: 'Aman', role: 'Head of Design' },
                { name: 'Saurav', role: 'Head of Operations' },
              ].map((member, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-background"
                >
                  <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    👤
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-foreground/70">{member.role}</p>
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
