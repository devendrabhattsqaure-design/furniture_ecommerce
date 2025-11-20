'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const footerSections = [
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Contact'],
    },
    {
      title: 'Shop',
      links: ['All Products', 'New Arrivals', 'Sale', 'Collections'],
    },
    {
      title: 'Support',
      links: ['FAQ', 'Shipping Info', 'Returns', 'Help Center'],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Sitemap'],
    },
  ];

  return (
    <footer className="bg-accent text-foreground py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">Luxury Furniture</h3>
            <p className="text-foreground/70">Premium furniture for your dreams</p>
          </div>

          {/* Links */}
          {footerSections.map(section => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-foreground/70 hover:text-primary transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-foreground/70 text-sm">
              © 2025 Luxury Furniture. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-2xl hover:opacity-70">
                f
              </a>
              <a href="#" className="text-2xl hover:opacity-70">
                𝕏
              </a>
              <a href="#" className="text-2xl hover:opacity-70">
                in
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
