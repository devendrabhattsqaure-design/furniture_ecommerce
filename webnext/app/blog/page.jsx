'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';

export default function BlogPage() {
  const posts = [
    {
      title: 'Interior Design Trends for 2024',
      excerpt: 'Discover the latest trends shaping modern interiors...',
      date: 'Dec 15, 2024',
      image: '/luxury-furniture-sofa.jpg',
    },
    {
      title: 'How to Choose the Perfect Sofa',
      excerpt: 'A comprehensive guide to selecting furniture for your space...',
      date: 'Dec 10, 2024',
      image: '/modern-sofa.jpg',
    },
    {
      title: 'Sustainable Furniture: Making a Difference',
      excerpt: 'Learn about eco-friendly furniture options...',
      date: 'Dec 5, 2024',
      image: '/dining-table.jpg',
    },
  ];

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl text-foreground/70">Tips, trends, and stories from Luxury Furniture</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <motion.article
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-accent rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className="h-48 overflow-hidden bg-primary/20">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                </div>
                <div className="p-6">
                  <p className="text-sm text-foreground/60 mb-2">{post.date}</p>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition">
                    {post.title}
                  </h3>
                  <p className="text-foreground/70 text-sm mb-4">{post.excerpt}</p>
                  <a href="#" className="text-primary font-semibold hover:underline">
                    Read More →
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
