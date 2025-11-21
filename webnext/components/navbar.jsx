'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { logoutUserAsync } from '@/redux/slices/authSlice.js';

// Lucide Icons
import { ShoppingCart, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  
  const { totalQuantity } = useAppSelector(state => state.cart);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logoutUserAsync());
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="font-bold text-2xl text-blue-600 tracking-wide">
            Luxury<span className="text-gray-900">Furniture</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="
                  text-gray-700 hover:text-blue-600 font-medium
                  transition relative group
                "
              >
                {item.label}
                <span className="
                  absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 
                  group-hover:w-full transition-all duration-300
                "></span>
              </Link>
            ))}
          </div>

          {/* Right Section Actions */}
          <div className="flex gap-4 items-center">
            
            {/* Cart - Goes to checkout page */}
            <Link 
  href="/checkout" 
  className="relative p-2 rounded-lg hover:bg-gray-100 transition"
  title="View Cart"
>
  <ShoppingCart size={22} className="text-gray-700" />
  {totalQuantity > 0 && (
    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {totalQuantity}
    </span>
  )}
</Link>

            {/* Auth Section */}
            {isAuthenticated ? (
  <div className="flex items-center gap-3">
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition">
        <User size={18} />
        <span className="text-sm text-gray-600">{user?.name}</span>
      </button>
      
      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <Link
          href="/profile"
          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl transition"
          onClick={() => setIsOpen(false)}
        >
          My Profile
        </Link>
        <Link
          href="/orders"
          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
          onClick={() => setIsOpen(false)}
        >
          My Orders
        </Link>
        <div className="border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
): (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="
                    px-4 py-2 text-blue-600 border border-blue-600 rounded-lg text-sm 
                    hover:bg-blue-50 transition
                  "
                >
                  Login
                </Link>
                {/* <Link
                  href="/register"
                  className="
                    px-4 py-2 bg-blue-600 text-white rounded-lg text-sm 
                    hover:bg-blue-700 transition
                  "
                >
                  Register
                </Link> */}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="md:hidden pb-4 border-t border-gray-200 mt-2"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  {item.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}