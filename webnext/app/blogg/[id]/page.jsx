'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

export default function BlogPostPage() {
  const params = useParams();
  const postId = params.id;
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        
        // Fetch the specific post
        const postResponse = await fetch(`${API_BASE_URL}/blog/${postId}`);
        
        if (!postResponse.ok) {
          throw new Error(`Failed to fetch post: ${postResponse.status}`);
        }
        
        const postData = await postResponse.json();
        
        if (postData.success) {
          setPost(postData.data);
          
          // Fetch all posts to get related ones (based on category)
          const allPostsResponse = await fetch(`${API_BASE_URL}/blog`);
          if (allPostsResponse.ok) {
            const allPostsData = await allPostsResponse.json();
            if (allPostsData.success) {
              // Filter related posts (same category, excluding current post)
              const related = allPostsData.data
                .filter(p => p.post_id !== postData.data.post_id && p.category === postData.data.category)
                .slice(0, 2);
              setRelatedPosts(related);
            }
          }
        } else {
          throw new Error(postData.message || 'Failed to fetch post');
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostData();
    }
  }, [postId]);

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate read time
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content ? content.split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Share function
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt || post?.meta_description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-32 mb-8"></div>
            <div className="h-12 bg-gray-300 rounded mb-6"></div>
            <div className="h-4 bg-gray-300 rounded w-48 mb-8"></div>
            <div className="h-96 bg-gray-300 rounded-xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Post Not Found</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground/60 mb-4">Post Not Found</h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {post.category && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              {post.category}
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-foreground/60 mb-6">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span className="font-medium">Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{formatDate(post.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{calculateReadTime(post.content)}</span>
            </div>
          </div>
        </motion.header>

        {/* Featured Image */}
        {post.featured_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-8 rounded-2xl overflow-hidden"
          >
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1758&q=80';
              }}
            />
          </motion.div>
        )}

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="prose prose-lg max-w-none"
        >
          <div 
            className="text-foreground/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content || '<p>No content available.</p>' }}
          />
        </motion.article>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center gap-4 mt-12 pt-8 border-t border-foreground/10"
        >
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            <Share2 size={16} />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-foreground/20 rounded-full hover:bg-foreground/5 transition-colors">
            <Bookmark size={16} />
            Save
          </button>
        </motion.div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-foreground">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.post_id}
                  href={`/blog/${relatedPost.post_id}`}
                  className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <h3 className="text-lg font-bold mb-2 text-foreground line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-foreground/60 text-sm line-clamp-2">
                    {relatedPost.excerpt || relatedPost.meta_description || 'Read more...'}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-foreground/40 text-sm">
                    <Calendar size={14} />
                    <span>{formatDate(relatedPost.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}