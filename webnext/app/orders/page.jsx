// webnext/app/orders/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/footer.jsx';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        {/* <Navbar /> */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">Loading orders...</div>
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
          <h1 className="text-4xl font-bold mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
              <p className="text-foreground/70 mb-6">You haven't placed any orders yet.</p>
              <a href="/products" className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90">
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order.order_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-accent rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">Order #{order.order_number}</h3>
                      <p className="text-foreground/70">Placed on {formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        ₹{order.total_amount}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Payment Method:</strong>
                      <p className="capitalize">{order.payment_method?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <strong>Shipping:</strong>
                      <p>₹{order.shipping_amount}</p>
                    </div>
                    <div>
                      <strong>Tax:</strong>
                      <p>₹{order.tax_amount}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.order_id === order.order_id ? null : order)}
                    className="mt-4 text-primary hover:underline"
                  >
                    {selectedOrder?.order_id === order.order_id ? 'Hide Details' : 'View Details'}
                  </button>

                  {selectedOrder?.order_id === order.order_id && (
                    <div className="mt-4 p-4 bg-background rounded-lg">
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {/* You would fetch order items here */}
                        <p className="text-foreground/70">Order items details would be shown here</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}