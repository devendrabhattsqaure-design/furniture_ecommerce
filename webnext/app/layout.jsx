import { Geist, Geist_Mono } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import './globals.css';
import { ReduxProvider } from '@/redux/provider.jsx';
import LayoutClient from '@/components/layout-client.jsx';
import CartHydration from '@/components/cart-hydration.jsx';

const geistSans = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata = {
  title: 'Luxury Furniture - Premium Furniture',
  description: 'Discover premium, modern furniture for your home',
  generator: 'v0.app'
};

export const viewport = {
  themeColor: '#ef4444',
  userScalable: true,
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head />
      <body className={`${geistSans.className} bg-background text-foreground`}>
        <ReduxProvider>
           <CartHydration />
          <LayoutClient>{children}</LayoutClient>
        </ReduxProvider>
      </body>
    </html>
  );
}
