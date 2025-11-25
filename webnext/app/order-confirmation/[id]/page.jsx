// app/order-confirmation/[id]/page.jsx
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { getOrder, clearCurrentOrder } from '@/redux/slices/orderSlice';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentOrder, loading } = useAppSelector(state => state.order);

  useEffect(() => {
    if (params.id) {
      dispatch(getOrder(params.id));
    }

    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground/70">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <button
            onClick={() => router.push('/shop')}
            className="text-primary hover:underline"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">✓</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-foreground/70">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <p className="text-sm text-foreground/60 mt-2">
            Order #: {currentOrder.order_number}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-accent rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-foreground/70">Order Status:</span>
                <span className={`font-semibold capitalize ${
                  currentOrder.order_status === 'confirmed' ? 'text-green-500' : 
                  currentOrder.order_status === 'pending' ? 'text-yellow-500' : 
                  'text-red-500'
                }`}>
                  {currentOrder.order_status}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-foreground/70">Order Date:</span>
                <span>{new Date(currentOrder.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-foreground/70">Payment Method:</span>
                <span className="capitalize">{currentOrder.payment_method}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-foreground/70">Total Amount:</span>
                <span className="font-bold text-primary">₹{currentOrder.total_amount}</span>
              </div>
            </div>

            {/* Shipping Address */}
            {currentOrder.address && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <p className="text-foreground/80">{currentOrder.address.address_line1}</p>
                <p className="text-foreground/80">
                  {currentOrder.address.landmark && `${currentOrder.address.landmark}, `}
                  {currentOrder.address.city} - {currentOrder.address.postal_code}
                </p>
                <p className="text-foreground/80">Phone: {currentOrder.address.phone}</p>
              </div>
            )}
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-accent rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Order Items</h2>
            
            <div className="space-y-4">
              {currentOrder.items?.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-b-0">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.product_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.product_name}</h4>
                    <p className="text-foreground/70 text-sm">Qty: {item.quantity}</p>
                    <p className="text-primary font-semibold">₹{item.total_price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-border space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{currentOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{currentOrder.shipping_amount === 0 ? 'Free' : `₹${currentOrder.shipping_amount}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₹{currentOrder.tax_amount}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total:</span>
                <span className="text-primary">₹{currentOrder.total_amount}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 justify-center mt-12"
        >
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition"
          >
            View All Orders
          </button>
          <button
            onClick={() => router.push('/shop')}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    </div>
  );
}