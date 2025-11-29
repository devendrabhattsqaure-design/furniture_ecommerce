import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Users, 
  DollarSign, 
  Package,
  CreditCard,
  X,
  Loader2,
  Calendar,
  ShoppingCart
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BillingManagement = () => {
  const [bills, setBills] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    items: [],
    discount_amount: '',
    discount_percentage: '',
    tax_amount: '',
    tax_percentage: '',
    payment_method: 'cash',
    notes: ''
  });

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchBills();
    fetchCategories();
  }, []);

  const fetchBills = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bills`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBills(data.data || []);
      } else {
        toast.error("Failed to fetch bills");
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error("Error loading bills");
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const searchProducts = async (search = '', categoryId = '') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryId) params.append('category_id', categoryId);

      const response = await fetch(`${API_BASE_URL}/bills/products/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchProducts(value, selectedCategory);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    searchProducts(searchTerm, value);
  };

  const addProductToBill = (product) => {
    const existingItem = formData.items.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      // Update quantity if product already exists
      const updatedItems = formData.items.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setFormData(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Add new product
      const newItem = {
        product_id: product.product_id,
        product_name: product.product_name,
        sku: product.sku,
        price: product.price,
        quantity: 1,
        total: product.price
      };
      setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
    
    toast.success(`${product.product_name} added to bill`);
  };

  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItemFromBill(productId);
      return;
    }

    const updatedItems = formData.items.map(item =>
      item.product_id === productId
        ? { 
            ...item, 
            quantity: newQuantity,
            total: item.price * newQuantity
          }
        : item
    );
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItemFromBill = (productId) => {
    const updatedItems = formData.items.filter(item => item.product_id !== productId);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    
    let discount = 0;
    if (formData.discount_amount) {
      discount = parseFloat(formData.discount_amount);
    } else if (formData.discount_percentage) {
      discount = (subtotal * parseFloat(formData.discount_percentage)) / 100;
    }

    let tax = 0;
    if (formData.tax_amount) {
      tax = parseFloat(formData.tax_amount);
    } else if (formData.tax_percentage) {
      tax = (subtotal * parseFloat(formData.tax_percentage)) / 100;
    }

    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total };
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      customer_address: '',
      items: [],
      discount_amount: '',
      discount_percentage: '',
      tax_amount: '',
      tax_percentage: '',
      payment_method: 'cash',
      notes: ''
    });
    setSearchTerm('');
    setSelectedCategory('');
    setProducts([]);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    searchProducts(); // Load initial products
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  const openViewModal = (bill) => {
    setSelectedBill(bill);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedBill(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name) {
      toast.error("Customer name is required");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Please add at least one product to the bill");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bills`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          items: formData.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Bill created successfully!");
        closeCreateModal();
        fetchBills();
      } else {
        toast.error(data.message || "Failed to create bill");
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, discount, tax, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <ToastContainer />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing Management</h1>
        <p className="text-gray-600">Create and manage customer bills</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{bills.reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Items Sold</p>
              <p className="text-2xl font-bold text-gray-900">
                {bills.reduce((sum, bill) => sum + parseInt(bill.total_quantity), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(bills.map(bill => bill.customer_name)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bills by customer name or bill number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Bill
            </button>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Recent Bills</h2>
        </div>

        {fetching ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No bills found</p>
            <p className="text-sm">Create your first bill to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Bill No.</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Subtotal</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill.bill_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-blue-600">{bill.bill_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{bill.customer_name}</div>
                        {bill.customer_phone && (
                          <div className="text-sm text-gray-500">{bill.customer_phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(bill.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {bill.total_quantity} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      ₹{parseFloat(bill.subtotal).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      ₹{parseFloat(bill.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bill.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                        bill.payment_method === 'card' ? 'bg-blue-100 text-blue-800' :
                        bill.payment_method === 'upi' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {bill.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openViewModal(bill)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Bill Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-800">Create New Bill</h3>
              <button onClick={closeCreateModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Customer Details */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800">Customer Information</h4>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={formData.customer_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter customer address"
                    />
                  </div>

                  {/* Product Search */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Add Products</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Search Products
                        </label>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Search by product name or SKU"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Filter by Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={handleCategoryChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Categories</option>
                          {categories.map(category => (
                            <option key={category.category_id} value={category.category_id}>
                              {category.category_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Product List */}
                    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                      {products.map(product => (
                        <div
                          key={product.product_id}
                          className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => addProductToBill(product)}
                        >
                          <div>
                            <div className="font-medium text-gray-900">{product.product_name}</div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku} | Stock: {product.stock_quantity} | ₹{product.price}
                            </div>
                          </div>
                          <Plus className="w-5 h-5 text-green-600" />
                        </div>
                      ))}
                      {products.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          No products found
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Bill Items & Summary */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800">Bill Items</h4>
                  
                  {/* Selected Items */}
                  <div className="border border-gray-200 rounded-lg">
                    {formData.items.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No items added to bill
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {formData.items.map((item) => (
                          <div key={item.product_id} className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{item.product_name}</div>
                              <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                  -
                                </button>
                                <span className="w-12 text-center">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                  +
                                </button>
                              </div>
                              <div className="w-20 text-right font-medium">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItemFromBill(item.product_id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bill Summary */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Bill Summary</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                      </div>

                      {/* Discount */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Discount Amount
                          </label>
                          <input
                            type="number"
                            value={formData.discount_amount}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              discount_amount: e.target.value,
                              discount_percentage: '' 
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Discount %
                          </label>
                          <input
                            type="number"
                            value={formData.discount_percentage}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              discount_percentage: e.target.value,
                              discount_amount: '' 
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>

                      {/* Tax */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tax Amount
                          </label>
                          <input
                            type="number"
                            value={formData.tax_amount}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              tax_amount: e.target.value,
                              tax_percentage: '' 
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tax %
                          </label>
                          <input
                            type="number"
                            value={formData.tax_percentage}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              tax_percentage: e.target.value,
                              tax_amount: '' 
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between font-bold text-lg border-t pt-3">
                        <span>Total Amount:</span>
                        <span className="text-green-600">₹{total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={formData.payment_method}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="online">Online</option>
                      </select>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.items.length === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Bill Modal */}
      {isViewModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-800">Bill Details - {selectedBill.bill_number}</h3>
              <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Bill Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Customer Information</h4>
                  <p className="text-lg font-bold">{selectedBill.customer_name}</p>
                  {selectedBill.customer_phone && (
                    <p className="text-gray-600">Phone: {selectedBill.customer_phone}</p>
                  )}
                  {selectedBill.customer_email && (
                    <p className="text-gray-600">Email: {selectedBill.customer_email}</p>
                  )}
                  {selectedBill.customer_address && (
                    <p className="text-gray-600">Address: {selectedBill.customer_address}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Bill Information</h4>
                  <p className="text-gray-600">Date: {new Date(selectedBill.created_at).toLocaleString()}</p>
                  <p className="text-gray-600">Created by: {selectedBill.created_by_name}</p>
                  <p className="text-gray-600">
                    Payment Method: <span className="font-medium capitalize">{selectedBill.payment_method}</span>
                  </p>
                </div>
              </div>

              {/* Bill Items */}
              <div className="border border-gray-200 rounded-lg mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedBill.items.map((item) => (
                      <tr key={item.bill_item_id}>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{item.product_name}</div>
                            <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">₹{parseFloat(item.unit_price).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">₹{parseFloat(item.total_price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bill Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{parseFloat(selectedBill.subtotal).toLocaleString()}</span>
                  </div>
                  {selectedBill.discount_amount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-₹{parseFloat(selectedBill.discount_amount).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedBill.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>+₹{parseFloat(selectedBill.tax_amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">₹{parseFloat(selectedBill.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedBill.notes && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Notes</h4>
                  <p className="text-blue-700">{selectedBill.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;