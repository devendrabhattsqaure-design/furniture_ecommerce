'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { registerUser } from '@/redux/slices/authSlice.js';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Registering user with:', { name, email, phone, password });
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Clean phone number - remove all formatting
    const cleanPhone = phone.replace(/\D/g, '');
    
    // If phone is provided, validate it
    if (cleanPhone && cleanPhone.length < 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    // Format phone with +91
    const formattedPhone = cleanPhone ? '+91' + cleanPhone : '';

    try {
      // Remove .unwrap() and handle the promise directly
      const result = await dispatch(registerUser(name, email, password, formattedPhone));
      
      // Check if the action was successful
      if (result.type === 'auth/registerUser/fulfilled') {
        router.push('/');
      }
      // If it was rejected, the error will be in the Redux state
    } catch (error) {
      console.error('Registration failed:', error);
      // Error is already handled in the slice state
    }
  };

  const formatIndianPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');
    
    if (phoneNumber.length === 0) return '';
    
    if (phoneNumber.length <= 2) {
      return '+91' + phoneNumber;
    } else if (phoneNumber.length <= 7) {
      return '+91 ' + phoneNumber.slice(2, 7);
    } else {
      return '+91 ' + phoneNumber.slice(2, 7) + ' ' + phoneNumber.slice(7, 12);
    }
  };

  const handlePhoneChange = (e) => {
    const formattedPhone = formatIndianPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-accent rounded-3xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-center text-foreground/60 mb-8">Join us to shop premium furniture</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number <span className="text-foreground/50 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 flex items-center">
                  <span className="text-sm">🇮🇳</span>
                  <span className="ml-1 text-xs">+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-16 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="98765 43210"
                  maxLength={16}
                />
              </div>
              <p className="text-xs text-foreground/60 mt-1">
                We'll use this for order updates and delivery notifications
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-xs text-foreground/60 mt-1">Minimum 6 characters</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-6 space-y-3">
            <button 
              type="button"
              className="w-full py-3 border border-border rounded-lg font-semibold hover:bg-accent transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="text-center text-foreground/70 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}