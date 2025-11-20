'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.js';
import { logoutUserAsync } from '@/redux/slices/authSlice';


// Lucide Icons
import { ShoppingCart,  Menu, X, User  } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { mode } = useAppSelector((state) => state.theme);
  const { items } = useAppSelector((state) => state.cart);

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
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="font-bold text-2xl text-primary tracking-wide">
            Luxury<span className="text-foreground">Furniture</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="
                  text-foreground/80 hover:text-primary font-medium
                  transition relative group
                "
              >
                {item.label}
                <span className="
                  absolute left-0 -bottom-1 w-0 h-[2px] bg-primary 
                  group-hover:w-full transition-all duration-300
                "></span>
              </Link>
            ))}
          </div>

          {/* Right Section Actions */}
          <div className="flex gap-4 items-center">

            

            {/* Cart */}
            <Link href="/checkout" className="relative p-2 rounded-lg hover:bg-accent transition">
              <ShoppingCart size={22}  />
              {items.length > 0 && (
                <span className="
                  absolute -top-1 -right-1 bg-primary text-white 
                  text-xs rounded-full w-5 h-5 flex items-center 
                  justify-center"
                >
                  {items.length}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-foreground/70">
                  <User size={18} />
                  {user?.name}
                </div>

                {/* <button
                  onClick={handleLogout}
                  className="
                    px-4 py-2 bg-primary text-white rounded-lg text-sm 
                    hover:opacity-90 transition
                  "
                >
                  Logout
                </button> */}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="
                    px-4 py-2 text-primary border border-primary rounded-lg text-sm 
                    hover:bg-primary/10 transition
                  "
                >
                  Login
                </Link>
              
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
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
              className="md:hidden pb-4 border-t border-border mt-2"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-foreground/80 hover:text-primary font-medium transition"
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
