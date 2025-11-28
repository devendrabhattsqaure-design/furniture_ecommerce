'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  MessageCircle,
  User,
  MailCheck,
  Sparkles,
  Building,
  Heart
} from 'lucide-react';

const Footer = dynamic(() => import('@/components/footer.jsx'));

export default function ContactPage() {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    message: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Contact form:', formData);
    alert('Thank you for your message! We will get back to you within 24 hours.');
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    { 
      icon: MapPin, 
      title: 'Visit Our Showroom', 
      content: '123 Design Street, Creative District, lko 226010',
      sub: 'Free parking available',
      color: 'text-red-500'
    },
    { 
      icon: Phone, 
      title: 'Call Us', 
      content: '+91 9876543212',
      sub: 'Mon-Fri: 9AM-6PM EST',
      color: 'text-red-500'
    },
    { 
      icon: Mail, 
      title: 'Email Us', 
      content: 'hello@OakEmpaire.com',
      sub: 'We reply within 24 hours',
      color: 'text-red-500'
    },
    { 
      icon: Clock, 
      title: 'Business Hours', 
      content: 'Monday - Friday: 9AM - 6PM',
      sub: 'Weekend: 10AM - 4PM',
      color: 'text-red-500'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50/30">
        {/* Enhanced Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">We're Here to Help</span>
              </motion.div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Get In Touch
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Ready to transform your space? Let's start a conversation about your dream furniture.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 px-4 -mt-20 relative z-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="relative"
              >
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-60"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-red-50 rounded-full blur-2xl opacity-60"></div>
                
                <motion.form
                  variants={itemVariants}
                  onSubmit={handleSubmit}
                  className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 space-y-6 border border-gray-200 shadow-2xl shadow-gray-200/30"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
                      Send Us a Message
                    </h2>
                    <p className="text-gray-600">We'll get back to you ASAP</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>

                    <div className="relative">
                      <MailCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>

                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <textarea
                        placeholder="Tell us about your project or inquiry..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows="6"
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all duration-300"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </motion.form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6"
              >
                {contactInfo.map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-200/30 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white group-hover:scale-110 transition-transform duration-300 border border-gray-100`}>
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-700 font-medium mb-1">{item.content}</p>
                        <p className="text-gray-500 text-sm">{item.sub}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Additional Info Card */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-white/20">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Showroom Experience</h3>
                      <p className="text-red-100 mb-3">
                        Visit our flagship showroom for a personalized consultation with our design experts.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-red-200">
                        <Sparkles className="w-4 h-4" />
                        <span>Complimentary design consultation available</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Response Card */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-white/10">
                      <Heart className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Why Choose Us?</h3>
                      <ul className="text-gray-300 space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span>24-48 hour response time</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span>Free design consultation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span>Lifetime warranty on all products</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 px-4 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                Visit Our Showroom
              </h2>
              <p className="text-xl text-gray-600 mb-2">OakEmpaire</p>
              <p className="text-lg text-gray-500">Come experience luxury furniture in person</p>
            </motion.div>

            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/50 border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3555.215982818945!2d81.016196!3d26.8602626!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399be3a65c97074d%3A0x9cd831d0311dc79b!2sBhatt%20Square!5e0!3m2!1sen!2sin!4v1699123456789!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>

            {/* Location Details */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
                <MapPin className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Address</h3>
                <p className="text-gray-600">OakEmpaire <br />Lucknow, Uttar Pradesh</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
                <Clock className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Open Hours</h3>
                <p className="text-gray-600">Mon-Sun: 10AM - 8PM<br />Weekends: 10AM - 9PM</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
                <Phone className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Get Directions</h3>
                <a 
                  href="https://maps.google.com/?q=26.8602626,81.016196"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}