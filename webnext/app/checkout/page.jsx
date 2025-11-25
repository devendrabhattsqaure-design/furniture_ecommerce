// app/checkout/page.jsx - Fix the useEffect for cart loading
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { 
  fetchCart, 
  clearCartAPI,
  removeFromCart,
  updateQuantity,
  loadLocalCart 
} from '@/redux/slices/cartSlice';
import { 
  fetchAddresses, 
  createAddress,
  setSelectedAddress 
} from '@/redux/slices/addressSlice';
import { createOrder } from '@/redux/slices/orderSlice';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { items, totalPrice, loading: cartLoading, isAuthenticated: cartAuthenticated } = useAppSelector(state => state.cart);
  const { addresses, selectedAddress, loading: addressLoading } = useAppSelector(state => state.address);
  const { loading: orderLoading, error: orderError, currentOrder } = useAppSelector(state => state.order);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  // Local states
  const [step, setStep] = useState('cart');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [customerNotes, setCustomerNotes] = useState('');
  const [newAddress, setNewAddress] = useState({
    address_type: 'home',
    phone: '',
    address_line1: '',
    landmark: '',
    city: '',
    postal_code: '',
    is_default: false
  });

 useEffect(() => {
    const loadCartData = async () => {
      if (isAuthenticated) {
        // For authenticated users, fetch from API
        await dispatch(fetchCart());
        await dispatch(fetchAddresses());
      } else {
        // For non-authenticated users, load from local storage
        dispatch(loadLocalCart());
      }
    };

    loadCartData();
  }, [dispatch, isAuthenticated]);

  // Redirect if order is successfully created
  useEffect(() => {
    if (currentOrder) {
      router.push(`/order-confirmation/${currentOrder.order_id}`);
    }
  }, [currentOrder, router]);

  // Handle address form submission
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createAddress(newAddress)).unwrap();
      setNewAddress({
        address_type: 'home',
        phone: '',
        address_line1: '',
        landmark: '',
        city: '',
        postal_code: '',
        is_default: false
      });
      setShowAddressForm(false);
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  // Handle order creation
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const orderData = {
      payment_method: paymentMethod,
      shipping_address_id: selectedAddress.address_id,
      billing_address_id: selectedAddress.address_id,
      customer_notes: customerNotes
    };

    try {
      await dispatch(createOrder(orderData)).unwrap();
      // Cart will be cleared automatically by the backend when order is created
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };
const displayItems = items.map(item => {
    // Ensure consistent property names between API and local storage
    return {
      id: item.product_id || item.id,
      cart_item_id: item.cart_item_id || `local_${item.product_id || item.id}`,
      name: item.product_name || item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image_url || item.image
    };
  });
  // Calculate order totals
  const taxAmount = totalPrice * 0.18; // 18% tax
  const shippingAmount = totalPrice >= 5000 ? 0 : 100;
  const finalTotal = totalPrice + taxAmount + shippingAmount;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login to Checkout</h2>
          <a href="/login" className="text-primary hover:underline">
            Sign in to your account
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Step 1: Cart Review */}
            {step === 'cart' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-accent rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                {displayItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-foreground/70 mb-4">Your cart is empty</p>
                    <a href="/shop" className="text-primary hover:underline">
                      Continue Shopping
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayItems.map(item => (
                      <div
                        key={item.cart_item_id}
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
                                onClick={() => {
                                  if (isAuthenticated) {
                                    // Use API for authenticated users
                                    dispatch(updateCartItemAPI({ 
                                      itemId: item.cart_item_id, 
                                      quantity: Math.max(1, item.quantity - 1) 
                                    }));
                                  } else {
                                    // Use local for non-authenticated users
                                    dispatch(updateQuantity({ 
                                      id: item.id, 
                                      quantity: Math.max(1, item.quantity - 1) 
                                    }));
                                  }
                                }}
                                className="px-2 py-1 bg-background rounded hover:bg-primary/10"
                              >
                                −
                              </button>
                              <span className="w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => {
                                  if (isAuthenticated) {
                                    dispatch(updateCartItemAPI({ 
                                      itemId: item.cart_item_id, 
                                      quantity: item.quantity + 1 
                                    }));
                                  } else {
                                    dispatch(updateQuantity({ 
                                      id: item.id, 
                                      quantity: item.quantity + 1 
                                    }));
                                  }
                                }}
                                className="px-2 py-1 bg-background rounded hover:bg-primary/10"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-primary font-semibold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => {
                                if (isAuthenticated) {
                                  dispatch(removeFromCartAPI(item.cart_item_id));
                                } else {
                                  dispatch(removeFromCart(item.id));
                                }
                              }}
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

                {displayItems.length > 0 && (
                  <button
                    onClick={() => setStep('shipping')}
                    className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Continue to Shipping
                  </button>
                )}
              </motion.div>
            )}

            {/* Step 2: Shipping Address */}
            {step === 'shipping' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-accent rounded-2xl p-6 space-y-6"
              >
                <h2 className="text-2xl font-bold">Shipping Information</h2>

                {/* Address Selection */}
                <div>
                  <h3 className="font-semibold mb-4">Select Shipping Address</h3>
                  
                  {addressLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="bg-background rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : addresses.length === 0 ? (
                    <p className="text-foreground/70 mb-4">No addresses saved</p>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map(address => (
                        <div
                          key={address.address_id}
                          className={`bg-background rounded-lg p-4 border-2 cursor-pointer transition ${
                            selectedAddress?.address_id === address.address_id
                              ? 'border-primary bg-primary/5'
                              : 'border-transparent hover:border-primary/50'
                          }`}
                          onClick={() => dispatch(setSelectedAddress(address))}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold capitalize">{address.address_type}</p>
                              <p className="text-foreground/80">{address.address_line1}</p>
                              <p className="text-foreground/80">
                                {address.landmark && `${address.landmark}, `}
                                {address.city} - {address.postal_code}
                              </p>
                              <p className="text-foreground/80">Phone: {address.phone}</p>
                            </div>
                            {address.is_default && (
                              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Address Button */}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full mt-4 py-3 border-2 border-dashed border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition"
                  >
                    + Add New Address
                  </button>

                  {/* New Address Form */}
                  {showAddressForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 p-4 bg-background rounded-lg"
                    >
                      <h4 className="font-semibold mb-4">Add New Address</h4>
                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <select
                            value={newAddress.address_type}
                            onChange={(e) => setNewAddress({ ...newAddress, address_type: e.target.value })}
                            className="px-4 py-2 bg-accent rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                          
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            className="px-4 py-2 bg-accent rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="Address Line 1"
                          value={newAddress.address_line1}
                          onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                          className="w-full px-4 py-2 bg-accent rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />

                        <input
                          type="text"
                          placeholder="Landmark (Optional)"
                          value={newAddress.landmark}
                          onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                          className="w-full px-4 py-2 bg-accent rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="City"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="px-4 py-2 bg-accent rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                          
                          <input
                            type="text"
                            placeholder="Postal Code"
                            value={newAddress.postal_code}
                            onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                            className="px-4 py-2 bg-accent rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newAddress.is_default}
                            onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                            className="w-4 h-4 accent-primary"
                          />
                          <span>Set as default address</span>
                        </label>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
                          >
                            Save Address
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="flex-1 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('cart')}
                    className="flex-1 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition"
                  >
                    Back to Cart
                  </button>
                  <button
                    onClick={() => setStep('payment')}
                    disabled={!selectedAddress}
                    className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-accent rounded-2xl p-6 space-y-6"
              >
                <h2 className="text-2xl font-bold">Payment Information</h2>

                {/* Payment Method Selection */}
                <div>
                  <h3 className="font-semibold mb-4">Select Payment Method</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                      { id: 'paypal', label: 'PayPal', icon: '🔵' },
                      { id: 'upi', label: 'UPI', icon: '📱' },
                      { id: 'cod', label: 'Cash on Delivery', icon: '💰' },
                    ].map(method => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 bg-background rounded-lg border-2 cursor-pointer transition ${
                          paymentMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Customer Notes */}
                <div>
                  <h3 className="font-semibold mb-4">Additional Notes (Optional)</h3>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Any special instructions for your order..."
                    className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows="3"
                  />
                </div>

                {/* Order Error */}
                {orderError && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
                    {orderError}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('shipping')}
                    className="flex-1 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition"
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={orderLoading || items.length === 0}
                    className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {orderLoading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
           <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-accent rounded-2xl p-6 h-fit sticky top-6"
          >
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            
            {/* Items List */}
            <div className="space-y-3 mb-4">
              {displayItems.map(item => (
                <div key={item.cart_item_id} className="flex justify-between text-sm">
                  <span className="flex-1 truncate">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="ml-2 font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 pb-4 border-b border-border">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingAmount === 0 ? 'Free' : `₹${shippingAmount.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Final Total */}
            <div className="flex justify-between text-lg font-bold pt-4 text-primary">
              <span>Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}