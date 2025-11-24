// webnext/app/checkout/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';
import { useAppSelector, useAppDispatch } from '@/redux/hooks.js';
import { removeFromCart, updateQuantity, clearCart } from '@/redux/slices/cartSlice.js';

export default function CheckoutPage() {
  const { items, totalPrice } = useAppSelector(state => state.cart);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const [step, setStep] = useState('cart');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
  });

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQuantity = (id, qty) => {
    dispatch(updateQuantity({ id, quantity: qty }));
  };

  const handlePlaceOrder = () => {
    dispatch(clearCart());
    alert('Order placed successfully!');
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please Login to Checkout</h2>
            <a href="/login" className="text-primary hover:underline">
              Sign in to your account
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main */}
            <div className="md:col-span-2 space-y-6">
              {step === 'cart' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-accent rounded-2xl p-6"
                >
                  <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                  {items.length === 0 ? (
                    <p className="text-foreground/70">Your cart is empty</p>
                  ) : (
                    <div className="space-y-4">
                      {items.map(item => (
                        <div
                          key={item.id}
                          className="flex gap-4 pb-4 border-b border-border last:border-b-0"
                        >
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">{item.name}</h4>
                            <div className="flex gap-4 items-end">
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className="px-2 py-1 bg-background rounded hover:bg-primary/10"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="px-2 py-1 bg-background rounded hover:bg-primary/10"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-primary font-semibold">
                                 ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                              <button
                                onClick={() => handleRemove(item.id)}
                                className="text-red-500 hover:opacity-70"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setStep('shipping')}
                    disabled={items.length === 0}
                    className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    Continue to Shipping
                  </button>
                </motion.div>
              )}

              {step === 'shipping' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-accent rounded-2xl p-6 space-y-4"
                >
                  <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={() => setStep('payment')}
                    className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Continue to Payment
                  </button>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-accent rounded-2xl p-6 space-y-4"
                >
                  <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Place Order
                  </button>
                </motion.div>
              )}
            </div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-accent rounded-2xl p-6 h-fit"
            >
              <h3 className="text-xl font-bold mb-4">Order Total</h3>
              <div className="space-y-2 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span> ₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span> ₹0</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span> ₹{(totalPrice * 0.08).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold pt-4 text-primary">
                <span>Total</span>
                <span> ₹{(totalPrice * 1.08).toFixed(2)}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
