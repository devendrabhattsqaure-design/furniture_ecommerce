// admin-panel/src/pages/dashboard/OrderManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  Filter, 
  Edit2, 
  Eye, 
  Trash2, 
  X, 
  Download,
  RefreshCw,
  MoreVertical,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const API_BASE_URL = "http://localhost:5000/api";

  // Order status options
  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
    { value: "processing", label: "Processing", color: "bg-purple-100 text-purple-800" },
    { value: "shipped", label: "Shipped", color: "bg-indigo-100 text-indigo-800" },
    { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
    { value: "refunded", label: "Refunded", color: "bg-gray-100 text-gray-800" }
  ];

  // Fetch all orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters when search term or filters change
  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, dateFilter]);

const fetchOrders = async () => {
  try {
    setFetchingOrders(true);
    const token = localStorage.getItem('token');
    
    // Build query parameters
    const params = new URLSearchParams();
    if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/admin/orders${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching orders from:', url); // Debug log
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status); // Debug log
    
    if (response.ok) {
      const data = await response.json();
      console.log('Full response data:', data); // Debug log
      console.log('Orders data:', data.orders); // Debug log
      
      // Fixed: Use data.orders and provide empty array as fallback
      setOrders(data.orders || []);
    } else {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      toast.error(errorData.message || "Failed to fetch orders");
      setOrders([]); // Set empty array on error
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    toast.error("Error loading orders");
    setOrders([]); // Set empty array on error
  } finally {
    setFetchingOrders(false);
  }
};

  const applyFilters = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.order_status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter(order => 
            new Date(order.created_at).toDateString() === today.toDateString()
          );
          break;
        case "week":
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(order => 
            new Date(order.created_at) >= filterDate
          );
          break;
        case "month":
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(order => 
            new Date(order.created_at) >= filterDate
          );
          break;
        default:
          break;
      }
    }

    setFilteredOrders(filtered);
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const openDetailsModal = async (order) => {
  try {
    setLoading(true);
    const orderDetails = await fetchOrderDetails(order.order_id);
    setSelectedOrder(orderDetails);
    setIsDetailsModalOpen(true);
  } catch (error) {
    toast.error("Failed to load order details");
    // Fallback to using the existing order data
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  } finally {
    setLoading(false);
  }
};

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
  };

 const handleStatusUpdate = async (newStatus) => {
  if (!selectedOrder) return;

  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/orders/${selectedOrder.order_id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(`Order status updated to ${newStatus}`);
      closeModal();
      fetchOrders(); // Refresh orders
    } else {
      toast.error(data.message || "Failed to update order status");
    }
  } catch (error) {
    console.error('Error updating order:', error);
    toast.error("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};
const fetchOrderDetails = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.order;
    } else {
      throw new Error('Failed to fetch order details');
    }
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

const handleDelete = async (orderId) => {
  if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Order deleted successfully");
      fetchOrders(); // Refresh order list
    } else {
      toast.error(data.message || "Failed to delete order");
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    toast.error("Network error. Please try again.");
  }
};

  const exportOrders = () => {
    // Simple CSV export implementation
    const headers = ['Order Number', 'Customer', 'Email', 'Total', 'Status', 'Date'];
    const csvData = filteredOrders.map(order => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      `₹${order.total_amount}`,
      order.order_status,
      new Date(order.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Orders exported successfully");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800";
  };

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'pending').length,
    delivered: orders.filter(o => o.order_status === 'delivered').length,
    revenue: orders
      .filter(o => o.order_status === 'delivered')
      .reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Stats Cards */}
      <div className="mb-8 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Orders */}
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-blue-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="p-6 text-right">
            <p className="text-sm text-gray-600 font-medium">Total Orders</p>
            <h4 className="text-3xl font-bold text-gray-900">{stats.total}</h4>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-yellow-600 to-yellow-400 text-white shadow-yellow-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="p-6 text-right">
            <p className="text-sm text-gray-600 font-medium">Pending</p>
            <h4 className="text-3xl font-bold text-gray-900">{stats.pending}</h4>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div className="p-6 text-right">
            <p className="text-sm text-gray-600 font-medium">Delivered</p>
            <h4 className="text-3xl font-bold text-gray-900">{stats.delivered}</h4>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-600 to-purple-400 text-white shadow-purple-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div className="p-6 text-right">
            <p className="text-sm text-gray-600 font-medium">Revenue</p>
            <h4 className="text-3xl font-bold text-gray-900">₹{stats.revenue.toFixed(2)}</h4>
          </div>
        </div>
      </div>

      {/* Order Management Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-64"
                />
              </div>

              {/* Export Button */}
              <button
                onClick={exportOrders}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                Export
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchOrders}
                disabled={fetchingOrders}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${fetchingOrders ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {fetchingOrders ? (
          <div className="flex justify-center items-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No orders found</p>
            <p className="text-sm">No orders match your current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          #{order.order_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items?.length || 0} items
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.customer_name || order.user?.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_email || order.user?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">
                        ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                        {getStatusIcon(order.order_status)}
                        {statusOptions.find(opt => opt.value === order.order_status)?.label || order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailsModal(order)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(order)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Edit Order"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.order_id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                Update Order Status
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold">#{selectedOrder.order_number}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Current Status</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.order_status)}`}>
                  {getStatusIcon(selectedOrder.order_status)}
                  {statusOptions.find(opt => opt.value === selectedOrder.order_status)?.label || selectedOrder.order_status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusUpdate(option.value)}
                      disabled={loading || selectedOrder.order_status === option.value}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedOrder.order_status === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded ${option.color}`}>
                          {getStatusIcon(option.value)}
                        </span>
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-800">
                Order Details - #{selectedOrder.order_number}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedOrder.customer_name || selectedOrder.user?.full_name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_email || selectedOrder.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer_phone || selectedOrder.user?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.order_status)}`}>
                        {getStatusIcon(selectedOrder.order_status)}
                        {statusOptions.find(opt => opt.value === selectedOrder.order_status)?.label || selectedOrder.order_status}
                      </span>
                    </p>
                    <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                    <p><strong>Payment Method:</strong> {selectedOrder.payment_method || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.image_url && (
                                <img src={item.image_url} alt={item.product_name} className="w-10 h-10 object-cover rounded" />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900">₹{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-gray-900">₹{parseFloat(item.total_price || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Totals */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{parseFloat(selectedOrder.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₹{parseFloat(selectedOrder.tax_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>₹{parseFloat(selectedOrder.shipping_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                      <span>Total:</span>
                      <span>₹{parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;