'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { Calendar, Clock, User, ArrowRight, BookOpen, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
const Footer = dynamic(() => import('@/components/footer.jsx'));
// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/blog`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blog posts: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setBlogPosts(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch blog posts');
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate read time based on content length
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content ? content.split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">Our Blog</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Furniture Insights
            </h1>
            <p className="text-foreground/60 text-xl max-w-2xl mx-auto">
              Loading articles...
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-48 bg-gray-300 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Error Loading Blog</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const featuredPost = blogPosts.length > 0 ? blogPosts[0] : null;
  const otherPosts = blogPosts.length > 1 ? blogPosts.slice(1) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full mb-6"
          >
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Our Blog</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Furniture Insights
          </h1>
          <p className="text-foreground/60 text-xl max-w-2xl mx-auto">
            Discover the latest trends, tips, and inspiration for creating beautiful living spaces
          </p>
        </motion.div>

        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative h-80 md:h-full">
                  <img
                    src={featuredPost.featured_image || '/api/placeholder/800/600'}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1758&q=80';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  {featuredPost.category && (
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4 self-start">
                      {featuredPost.category}
                    </div>
                  )}
                  <h2 className="text-3xl font-bold mb-4 text-foreground">
                    {featuredPost.title}
                  </h2>
                  <p className="text-foreground/70 mb-6 text-lg leading-relaxed">
                    {featuredPost.excerpt || featuredPost.meta_description || 'Read more about this topic...'}
                  </p>
                  <div className="flex items-center gap-6 text-foreground/60 mb-6">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span className="text-sm">Admin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span className="text-sm">{formatDate(featuredPost.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span className="text-sm">{calculateReadTime(featuredPost.content)}</span>
                    </div>
                  </div>
                  <Link
                    href={`/blogg/${featuredPost.post_id}`}
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors group self-start"
                  >
                    Read More
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Blog Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {otherPosts.map((post, index) => (
            <motion.article
              key={post.post_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative h-48">
                <img
                  src={post.featured_image || '/api/placeholder/400/300'}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80';
                  }}
                />
                {post.category && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {post.category}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-foreground line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-foreground/70 mb-4 line-clamp-3">
                  {post.excerpt || post.meta_description || 'Click to read more...'}
                </p>
                <div className="flex items-center justify-between text-foreground/60 text-sm mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>Admin</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{calculateReadTime(post.content)}</span>
                  </div>
                </div>
                <Link
                  href={`/blogg/${post.post_id}`}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all group"
                >
                  Read Article
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* No Posts Message */}
        {blogPosts.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookOpen size={64} className="mx-auto text-foreground/20 mb-4" />
            <h3 className="text-2xl font-bold text-foreground/60 mb-2">No Blog Posts Yet</h3>
            <p className="text-foreground/40">Check back later for new articles!</p>
          </motion.div>
        )}

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Get the latest furniture trends and design tips delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-primary px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}