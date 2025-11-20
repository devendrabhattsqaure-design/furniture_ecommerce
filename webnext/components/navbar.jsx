'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { logout } from '@/redux/slices/authSlice.js';
import { toggleTheme } from '@/redux/slices/themeSlice.js';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const { mode } = useAppSelector(state => state.theme);
  const { items } = useAppSelector(state => state.cart);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleTheme = () => {
    dispatch(toggleTheme());
    document.documentElement.setAttribute('data-theme', mode === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl text-primary">
            LuxeFurn
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-primary transition"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 items-center">
            {/* Theme Toggle */}
            <button
              onClick={handleTheme}
              className="p-2 rounded-lg hover:bg-accent transition"
            >
              {mode === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Cart */}
            <Link
              href="/checkout"
              className="relative p-2 rounded-lg hover:bg-accent transition"
            >
              🛒
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex gap-2">
                <span className="text-sm text-foreground/70">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-primary border border-primary rounded-lg text-sm hover:bg-primary/10 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4 border-t border-border"
          >
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-foreground hover:text-primary transition"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
