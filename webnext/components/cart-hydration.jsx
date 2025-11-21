// components/cart-hydration.jsx
'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks.js';
import { loadCartFromStorage } from '@/redux/slices/cartSlice.js';

export default function CartHydration() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load cart from localStorage when component mounts
    dispatch(loadCartFromStorage());
  }, [dispatch]);

  return null; // This component doesn't render anything
}