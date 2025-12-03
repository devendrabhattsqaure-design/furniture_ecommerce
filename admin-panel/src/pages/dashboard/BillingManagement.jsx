import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Download, 
  Printer, 
  Users, 
  DollarSign, 
  Package,
  X,
  Loader2,
  FileText,
  Eye,
  Copy,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Building,
  Hash,
  FileDigit
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const BillingManagement = () => {
  const [bills, setBills] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
const [paymentAmount, setPaymentAmount] = useState('');

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
    notes: '',
    paid_amount: '', // Add this
  due_date: '' // Add this
  });

  const API_BASE_URL = "http://localhost:5000/api";

  // Get organization ID from localStorage or auth context
 const getOrgId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.org_id || null;
  } catch (e) {
    return null;
  }
};

const [orgId, setOrgId] = useState(null);

useEffect(() => {
  const id = getOrgId();
  console.log("ORG ID LOADED:", id);
  setOrgId(id);
}, []);

useEffect(() => {
  if (orgId) {
    fetchOrganization(orgId);
    fetchBills(orgId);
    fetchCategories(orgId);
  }
}, [orgId]);


  const fetchOrganization = async () => {
    try {
      const token = localStorage.getItem('token');
      const orgId = getOrgId();
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrganization(data.data);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  };

  const fetchBills = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bills`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-org-id': getOrgId() // Send organization ID in header
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
          'Authorization': `Bearer ${token}`,
          'x-org-id': getOrgId()
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
          'Authorization': `Bearer ${token}`,
          'x-org-id': getOrgId()
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
  const openPaymentModal = (bill) => {
  setSelectedBillForPayment(bill);
  setPaymentAmount(bill.due_amount);
  setIsPaymentModalOpen(true);
};

const closePaymentModal = () => {
  setIsPaymentModalOpen(false);
  setSelectedBillForPayment(null);
  setPaymentAmount('');
};
const handlePaymentUpdate = async () => {
  if (!selectedBillForPayment) return;
  
  const payment = parseFloat(paymentAmount);
  if (!payment || isNaN(payment) || payment <= 0) {
    toast.error('Please enter a valid payment amount');
    return;
  }

  const currentPaid = parseFloat(selectedBillForPayment.paid_amount || 0);
  const currentDue = parseFloat(selectedBillForPayment.due_amount || 0);
  const totalAmount = parseFloat(selectedBillForPayment.total_amount || 0);
  
  // Calculate new paid amount
  const newPaidAmount = Math.min(currentPaid + payment, totalAmount);
  const newDueAmount = Math.max(0, totalAmount - newPaidAmount);
  
  if (payment > currentDue) {
    toast.error(`Maximum payment amount is ₹${currentDue.toLocaleString('en-IN')}`);
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/bills/${selectedBillForPayment.bill_id}/payment`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-org-id': getOrgId()
      },
      body: JSON.stringify({ 
        paid_amount: newPaidAmount,
        payment_amount: payment // Send the additional payment amount
      })
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(`Payment of ₹${payment.toLocaleString('en-IN')} recorded successfully!`);
      closePaymentModal();
      fetchBills();
      
      // Update the selected bill in state
      if (selectedBill && selectedBill.bill_id === selectedBillForPayment.bill_id) {
        setSelectedBill(prev => ({
          ...prev,
          paid_amount: newPaidAmount,
          due_amount: newDueAmount,
          payment_status: newDueAmount === 0 ? 'paid' : 'partial'
        }));
      }
    } else {
      toast.error(data.message || 'Failed to update payment');
    }
  } catch (error) {
    console.error('Error updating payment:', error);
    toast.error('Network error. Please try again.');
  }
};

  const addProductToBill = (product) => {
  const existingItem = formData.items.find(item => item.product_id === product.product_id);
  
  if (existingItem) {
    const updatedItems = formData.items.map(item =>
      item.product_id === product.product_id
        ? { 
            ...item, 
            quantity: item.quantity + 1,
            total: parseFloat(product.price) * (item.quantity + 1)
          }
        : item
    );
    setFormData(prev => ({ ...prev, items: updatedItems }));
  } else {
    const newItem = {
      product_id: product.product_id,
      product_name: product.product_name,
      sku: product.sku,
      price: parseFloat(product.price),
      quantity: 1,
      total: parseFloat(product.price)
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
          total: parseFloat(item.price) * newQuantity
        }
      : item
  );
  setFormData(prev => ({ ...prev, items: updatedItems }));
};
  const removeItemFromBill = (productId) => {
    const updatedItems = formData.items.filter(item => item.product_id !== productId);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

// Update the calculateTotals function to work correctly
const calculateTotals = () => {
  // Calculate item totals first
  const itemsWithTotals = formData.items.map(item => ({
    ...item,
    total: parseFloat(item.price || 0) * parseInt(item.quantity || 0)
  }));

  // Update formData with correct totals if needed
  if (formData.items.some((item, index) => 
    item.total !== itemsWithTotals[index].total
  )) {
    setFormData(prev => ({ ...prev, items: itemsWithTotals }));
  }

  const subtotal = itemsWithTotals.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  
  // Calculate discount
  let discount = 0;
  if (formData.discount_amount && !isNaN(parseFloat(formData.discount_amount))) {
    discount = parseFloat(formData.discount_amount);
  } else if (formData.discount_percentage && !isNaN(parseFloat(formData.discount_percentage))) {
    discount = (subtotal * parseFloat(formData.discount_percentage)) / 100;
  }

  // Calculate tax (use organization GST if not specified)
  let tax = 0;
  if (formData.tax_amount && !isNaN(parseFloat(formData.tax_amount))) {
    tax = parseFloat(formData.tax_amount);
  } else if (formData.tax_percentage && !isNaN(parseFloat(formData.tax_percentage))) {
    tax = (subtotal * parseFloat(formData.tax_percentage)) / 100;
  } else if (organization && organization.gst_percentage) {
    tax = (subtotal * parseFloat(organization.gst_percentage)) / 100;
  }

  const total = parseFloat((subtotal - discount + tax).toFixed(2));
  
  // Calculate paid and due amounts
  const paidAmount = parseFloat(formData.paid_amount) || 0;
  const dueAmount = Math.max(0, parseFloat((total - paidAmount).toFixed(2)));
  
  // Determine payment status
  let paymentStatus = 'pending';
  if (paidAmount >= total) {
    paymentStatus = 'paid';
  } else if (paidAmount > 0) {
    paymentStatus = 'partial';
  }

  return { 
    subtotal: parseFloat(subtotal.toFixed(2)), 
    discount: parseFloat(discount.toFixed(2)), 
    tax: parseFloat(tax.toFixed(2)), 
    total,
    paidAmount: parseFloat(paidAmount.toFixed(2)),
    dueAmount: parseFloat(dueAmount.toFixed(2)),
    paymentStatus
  };
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
    notes: '',
    paid_amount: '',
    due_date: ''
  });
  setSearchTerm('');
  setSelectedCategory('');
  setProducts([]);
};

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    searchProducts();
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

const openViewModal = async (bill) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/bills/${bill.bill_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-org-id': getOrgId()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Bill details:', data.data); // Debug log
      
      if (data.success) {
        setSelectedBill(data.data);
        setIsViewModalOpen(true);
      } else {
        toast.error(data.message);
      }
    } else {
      toast.error("Failed to fetch bill details");
    }
  } catch (error) {
    console.error('Error fetching bill details:', error);
    toast.error("Error loading bill details");
  }
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
    const totals = calculateTotals();
    const token = localStorage.getItem('token');
    
    // Prepare bill data with correct calculations
    const billData = {
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone || '',
      customer_email: formData.customer_email || '',
      customer_address: formData.customer_address || '',
      items: formData.items.map(item => ({
        product_id: item.product_id,
        quantity: parseInt(item.quantity)
      })),
      discount_amount: totals.discount > 0 ? totals.discount.toString() : '',
      discount_percentage: formData.discount_percentage || '',
      tax_amount: totals.tax > 0 ? totals.tax.toString() : '',
      tax_percentage: formData.tax_percentage || '',
      payment_method: formData.payment_method,
      notes: formData.notes || '',
      paid_amount: formData.paid_amount || totals.total.toString(),
      due_date: formData.due_date || null
    };

    console.log('Submitting bill:', billData); // Debug log

    const response = await fetch(`${API_BASE_URL}/bills`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-org-id': getOrgId()
      },
      body: JSON.stringify(billData)
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Bill created successfully!");
      closeCreateModal();
      fetchBills();
    } else {
      console.error('Error response:', data);
      toast.error(data.message || "Failed to create bill");
    }
  } catch (error) {
    console.error('Error creating bill:', error);
    toast.error("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};

 const downloadInvoice = async (bill) => {
  try {
    // Create a temporary div for PDF generation
    const tempElement = document.createElement('div');
    tempElement.style.position = 'fixed';
    tempElement.style.left = '-9999px';
    tempElement.style.top = '0';
    tempElement.style.width = '800px';
    tempElement.style.padding = '20px';
    tempElement.style.backgroundColor = 'white';
    tempElement.style.fontFamily = 'Arial, sans-serif';
    tempElement.style.boxSizing = 'border-box';
    
    // Generate the invoice HTML
    const invoiceHTML = generateInvoiceHTML(bill);
    tempElement.innerHTML = invoiceHTML;
    document.body.appendChild(tempElement);
    
    // Wait a bit for rendering
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const canvas = await html2canvas(tempElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempElement.scrollHeight
    });
    
    // Remove temporary element
    document.body.removeChild(tempElement);
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Save the PDF
    pdf.save(`Invoice_${bill.bill_number}.pdf`);
    toast.success("Invoice downloaded successfully!");
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error("Failed to download invoice");
  }
};
// Update the generateInvoiceHTML function to be compact and professional
const generateInvoiceHTML = (bill) => {
  return `
    <div style="font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
      <!-- Header with Organization Details -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
        <!-- Left: Organization Info -->
        <div style="flex: 1;">
          ${bill.org_logo ? `
            <img src="${bill.org_logo}" alt="${bill.org_name}" style="height: 60px; margin-bottom: 10px;" />
          ` : ''}
          <h1 style="font-size: 22px; font-weight: bold; margin: 0 0 5px 0; color: #333;">${bill.org_name || 'Organization'}</h1>
          <div style="font-size: 11px; color: #555; line-height: 1.4;">
            <div>${bill.address || ''}</div>
            <div>Phone: ${bill.primary_phone || ''} ${bill.secondary_phone ? ` | ${bill.secondary_phone}` : ''}</div>
            ${bill.gst_number ? `<div style="font-weight: bold; margin-top: 3px;">GSTIN: ${bill.gst_number}</div>` : ''}
          </div>
        </div>
        
        <!-- Right: Invoice Title -->
        <div style="text-align: right;">
          <h2 style="font-size: 28px; font-weight: bold; margin: 0 0 5px 0; color: #333;">TAX INVOICE</h2>
          <div style="font-size: 14px; font-weight: bold; color: #666;">#${bill.bill_number}</div>
          <div style="font-size: 11px; color: #555; margin-top: 5px;">
            <div>Date: ${new Date(bill.created_at).toLocaleDateString('en-IN')}</div>
            <div>Time: ${new Date(bill.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      </div>

      <!-- Billing Details Compact -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px;">
        <!-- Bill To -->
        <div style="flex: 1;">
          <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 3px;">BILL TO:</h3>
          <div style="line-height: 1.5;">
            <div style="font-weight: bold; font-size: 13px;">${bill.customer_name}</div>
            ${bill.customer_phone ? `<div style="margin-top: 2px;">📞 ${bill.customer_phone}</div>` : ''}
            ${bill.customer_email ? `<div style="margin-top: 2px;">✉️ ${bill.customer_email}</div>` : ''}
            ${bill.customer_address ? `<div style="margin-top: 2px; color: #666;">${bill.customer_address}</div>` : ''}
          </div>
        </div>
        
        <!-- Invoice Details -->
        <div style="flex: 1; text-align: right;">
          <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 3px;">INVOICE DETAILS:</h3>
          <div style="line-height: 1.5;">
            <div><strong>Bill No:</strong> ${bill.bill_number}</div>
            <div><strong>Payment Method:</strong> ${bill.payment_method.toUpperCase()}</div>
            <div><strong>Issued By:</strong> ${bill.created_by_name || 'System'}</div>
            ${bill.payment_status === 'partial' ? `
              <div style="margin-top: 5px;">
                <div><strong>Payment Status:</strong> <span style="color: #e67e22;">PARTIAL</span></div>
                <div><strong>Amount Paid:</strong> ₹${parseFloat(bill.paid_amount || 0).toLocaleString('en-IN')}</div>
                <div><strong>Due Amount:</strong> ₹${parseFloat(bill.due_amount || 0).toLocaleString('en-IN')}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Items Table - Compact -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
        <thead>
          <tr style="background-color: #f8f9fa; border: 1px solid #ddd;">
            <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: left; font-weight: bold; width: 5%;">Sr.</th>
            <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: left; font-weight: bold; width: 40%;">Product Description</th>
            <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: left; font-weight: bold; width: 15%;">SKU</th>
            <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: right; font-weight: bold; width: 10%;">Price (₹)</th>
            <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: center; font-weight: bold; width: 10%;">Qty</th>
            <th style="border: 1px solid #ddd; padding: 8px 5px; text-align: right; font-weight: bold; width: 15%;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${bill.items ? bill.items.map((item, index) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 8px 5px;">
                <div style="font-weight: bold; font-size: 12px;">${item.product_name}</div>
                ${item.description ? `<div style="font-size: 10px; color: #666; margin-top: 2px;">${item.description}</div>` : ''}
              </td>
              <td style="border: 1px solid #ddd; padding: 8px 5px;">${item.sku || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: right;">${parseFloat(item.unit_price || 0).toLocaleString('en-IN')}</td>
              <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: center;">${item.quantity || 0}</td>
              <td style="border: 1px solid #ddd; padding: 8px 5px; text-align: right; font-weight: bold;">${parseFloat(item.total_price || 0).toLocaleString('en-IN')}</td>
            </tr>
          `).join('') : ''}
        </tbody>
      </table>

      <!-- Totals Section - Compact -->
      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 250px;">
          <!-- Subtotal -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px;">
            <span>Subtotal:</span>
            <span>₹${parseFloat(bill.subtotal || 0).toLocaleString('en-IN')}</span>
          </div>
          
          <!-- Discount -->
          ${bill.discount_amount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; color: #e74c3c;">
              <span>Discount:</span>
              <span>-₹${parseFloat(bill.discount_amount || 0).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          
          <!-- Tax -->
          ${bill.tax_amount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px;">
              <span>Tax (${bill.gst_percentage || 0}%):</span>
              <span>+₹${parseFloat(bill.tax_amount || 0).toLocaleString('en-IN')}</span>
            </div>
            ${bill.gst_type ? `
              <div style="font-size: 10px; color: #666; text-align: right; margin-bottom: 5px;">
                GST Type: ${bill.gst_type}
              </div>
            ` : ''}
          ` : ''}
          
          <!-- Grand Total -->
          <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #333; margin-top: 8px; font-size: 14px; font-weight: bold;">
            <span>GRAND TOTAL:</span>
            <span>₹${parseFloat(bill.total_amount || 0).toLocaleString('en-IN')}</span>
          </div>
          
          <!-- Payment Status -->
          ${bill.payment_status !== 'paid' ? `
            <div style="margin-top: 10px; padding: 8px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; font-size: 11px;">
              <div><strong>Payment Status:</strong> ${bill.payment_status.toUpperCase()}</div>
              <div><strong>Amount Paid:</strong> ₹${parseFloat(bill.paid_amount || 0).toLocaleString('en-IN')}</div>
              <div><strong>Amount Due:</strong> ₹${parseFloat(bill.due_amount || 0).toLocaleString('en-IN')}</div>
              ${bill.due_date ? `<div><strong>Due Date:</strong> ${new Date(bill.due_date).toLocaleDateString('en-IN')}</div>` : ''}
            </div>
          ` : ''}
          
          <!-- Amount in Words -->
          <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 4px; font-size: 11px;">
            <div style="font-weight: bold; margin-bottom: 3px;">Amount in Words:</div>
            <div style="color: #555;">${amountInWords(bill.total_amount || 0)}</div>
          </div>
        </div>
      </div>

      ${bill.notes ? `
        <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-left: 3px solid #3498db; font-size: 11px;">
          <div style="font-weight: bold; margin-bottom: 3px;">Notes:</div>
          <div>${bill.notes}</div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #777;">
        <div style="display: flex; justify-content: space-between;">
          <div style="flex: 1;">
            <div style="font-weight: bold; margin-bottom: 5px;">Declaration</div>
            <div>This is a computer-generated invoice and does not require a physical signature.</div>
          </div>
          <div style="flex: 1; text-align: right;">
            <div style="font-weight: bold; margin-bottom: 5px;">For ${bill.org_name || 'Organization'}</div>
            <div style="margin-top: 40px;">
              <div>Authorized Signatory</div>
              <div style="border-top: 1px solid #333; width: 150px; margin-left: auto; margin-top: 5px;"></div>
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <div>Thank you for your business!</div>
          <div style="margin-top: 5px;">Invoice generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    </div>
  `;
};

  const { subtotal, discount, tax, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <ToastContainer />

      {/* Header */}
      <div className="mb-8 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing Management</h1>
        <p className="text-gray-600">Create and manage customer bills</p>
      </div>

      {organization && (
        <div className="mb-6 px-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Building className="w-6 h-6" />
                  {organization.org_name}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({organization.gst_number || 'No GST'})
                  </span>
                </h1>
                <p className="text-gray-600 mt-1">{organization.address}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {organization.primary_phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {organization.contact_person_name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">GST Type: {organization.gst_type}</div>
                <div className="text-sm text-gray-600">GST %: {organization.gst_percentage}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards - Compact */}
      <div className="mb-6 px-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-xl font-bold text-gray-900">{bills.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{bills.reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Items Sold</p>
              <p className="text-xl font-bold text-gray-900">
                {bills.reduce((sum, bill) => sum + parseInt(bill.total_quantity), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-green-100 rounded-lg">
        <DollarSign className="w-5 h-5 text-green-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">Total Collected</p>
        <p className="text-xl font-bold text-gray-900">
          ₹{bills.reduce((sum, bill) => sum + parseFloat(bill.paid_amount || 0), 0).toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  </div>
    <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-red-100 rounded-lg">
        <DollarSign className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">Total Dues</p>
        <p className="text-xl font-bold text-gray-900">
          ₹{bills.reduce((sum, bill) => sum + parseFloat(bill.due_amount || 0), 0).toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  </div>
      </div>

      {/* Actions Bar - Compact */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 mx-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bills..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Bill
          </button>
        </div>
      </div>

      {/* Bills Table - Compact */}
      <div className="bg-white rounded-lg shadow-sm border mx-4 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Recent Bills</h2>
        </div>

        {fetching ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No bills found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
  <tr>
    <th className="px-4 py-2 text-left font-medium text-gray-600">Bill No.</th>
    <th className="px-4 py-2 text-left font-medium text-gray-600">Customer</th>
    <th className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
    <th className="px-4 py-2 text-left font-medium text-gray-600">Total</th>
    <th className="px-4 py-2 text-left font-medium text-gray-600">Paid</th>
    <th className="px-4 py-2 text-left font-medium text-gray-600">Due</th>
    <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
    <th className="px-4 py-2 text-left font-medium text-gray-600">Actions</th>
  </tr>
</thead>
              <tbody className="divide-y divide-gray-200">
                {bills.map((bill) => (
  <tr key={bill.bill_id} className="hover:bg-gray-50">
    <td className="px-4 py-3">
      <div className="font-medium text-blue-600">{bill.bill_number}</div>
    </td>
    <td className="px-4 py-3">
      <div className="font-medium text-gray-900">{bill.customer_name}</div>
      {bill.customer_phone && (
        <div className="text-xs text-gray-500">{bill.customer_phone}</div>
      )}
    </td>
    <td className="px-4 py-3 text-gray-700">
      {new Date(bill.created_at).toLocaleDateString()}
    </td>
    <td className="px-4 py-3 font-medium text-gray-900">
      ₹{parseFloat(bill.total_amount).toLocaleString('en-IN')}
    </td>
    <td className="px-4 py-3 text-green-600 font-medium">
      ₹{parseFloat(bill.paid_amount || 0).toLocaleString('en-IN')}
    </td>
    <td className="px-4 py-3 text-red-600 font-medium">
      ₹{parseFloat(bill.due_amount || 0).toLocaleString('en-IN')}
    </td>

<td className="px-4 py-3">
  <div className="flex items-center gap-1">
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      bill.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
      bill.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
      'bg-red-100 text-red-800'
    }`}>
      {bill.payment_status === 'paid' ? (
        <>
          <DollarSign className="w-3 h-3 mr-1" />
          Paid
        </>
      ) : bill.payment_status === 'partial' ? (
        <>
          <DollarSign className="w-3 h-3 mr-1" />
          Partial
        </>
      ) : (
        <>
          <DollarSign className="w-3 h-3 mr-1" />
          Pending
        </>
      )}
    </span>
    {bill.due_amount > 0 && bill.due_date && (
      <span className="text-xs text-gray-500 ml-1">
        Due: {new Date(bill.due_date).toLocaleDateString()}
      </span>
    )}
  </div>
</td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => openViewModal(bill)}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        {bill.due_amount > 0 && (
          <button
            onClick={() => openPaymentModal(bill)}
            className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
          >
            <DollarSign className="w-4 h-4" />
            Pay
          </button>
        )}
      </div>
    </td>
  </tr>
))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Bill Modal - Compact */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-800">Create New Bill</h3>
              <button onClick={closeCreateModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column - Compact Customer Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Customer Information
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.customer_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Customer name"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            <Phone className="w-3 h-3 inline mr-1" />
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.customer_phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            placeholder="Phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            <Mail className="w-3 h-3 inline mr-1" />
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.customer_email}
                            onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            placeholder="Email address"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          Address
                        </label>
                        <textarea
                          value={formData.customer_address}
                          onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                          rows="2"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          placeholder="Customer address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Search - Compact */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">Add Products</h4>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            placeholder="Search products..."
                          />
                        </div>

                        <div>
                          <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
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

                      <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                        {products.map(product => (
                          <div
                            key={product.product_id}
                            className="flex items-center justify-between p-2 border-b border-gray-200 hover:bg-white cursor-pointer text-sm"
                            onClick={() => addProductToBill(product)}
                          >
                            <div>
                              <div className="font-medium">{product.product_name}</div>
                              <div className="text-xs text-gray-500">
                                ₹{product.price} | Stock: {product.stock_quantity}
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-green-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Bill Summary */}
                <div className="space-y-4">
                  {/* Selected Items - Compact */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">Bill Items ({formData.items.length})</h4>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {formData.items.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-4">
                          No items added
                        </div>
                      ) : (
                        formData.items.map((item) => (
                          <div key={item.product_id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{item.product_name}</div>
                              <div className="text-xs text-gray-500">₹{item.price} × {item.quantity}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                              <div className="w-16 text-right font-medium text-sm">
                                ₹{item.total}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItemFromBill(item.product_id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Bill Summary - Compact */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">Bill Summary</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Discount (₹)
                          </label>
                          <input
                            type="number"
                            value={formData.discount_amount}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              discount_amount: e.target.value,
                              discount_percentage: '' 
                            }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            value={formData.discount_percentage}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              discount_percentage: e.target.value,
                              discount_amount: '' 
                            }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tax (₹)
                          </label>
                          <input
                            type="number"
                            value={formData.tax_amount}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              tax_amount: e.target.value,
                              tax_percentage: '' 
                            }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tax (%)
                          </label>
                          <input
                            type="number"
                            value={formData.tax_percentage}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              tax_percentage: e.target.value,
                              tax_amount: '' 
                            }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-green-600">₹{total.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                   
  

                    
                   
<div className="bg-gray-50 p-3 rounded-lg mt-4">
  {/* <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
    <DollarSign className="w-4 h-4" />
    Payment Information
  </h4> */}
  
  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Amount Paid (₹)
      </label>
      <input
        type="number"
        value={formData.paid_amount}
        onChange={(e) => {
          const value = e.target.value;
          setFormData(prev => ({ 
            ...prev, 
            paid_amount: value
          }));
        }}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="0.00"
        step="0.01"
        min="0"
        max={calculateTotals().total}
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Due Date
      </label>
      <input
        type="date"
        value={formData.due_date}
        onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
      />
    </div>
  </div>
  
  {/* Real-time payment calculation */}
  <div className="mt-3 space-y-2">
    <div className="flex justify-between text-sm">
      <span className="font-medium">Total Amount:</span>
      <span className="font-bold">₹{calculateTotals().total.toLocaleString('en-IN')}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="font-medium">Amount Paid:</span>
      <span className="text-green-600 font-bold">
        ₹{(parseFloat(formData.paid_amount) || 0).toLocaleString('en-IN')}
      </span>
    </div>
    <div className="flex justify-between text-sm border-t pt-2">
      <span className="font-medium">Balance Due:</span>
      <span className={`font-bold ${calculateTotals().dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
        ₹{calculateTotals().dueAmount.toLocaleString('en-IN')}
      </span>
    </div>
    
    {calculateTotals().dueAmount > 0 && (
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800 text-center">
          This will create a {calculateTotals().paymentStatus} payment bill
        </p>
      </div>
    )}
  </div>
</div>
<div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Payment Method
                        </label>
                        <select
                          value={formData.payment_method}
                          onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          rows="2"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          placeholder="Additional notes..."
                        />
                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.items.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Payment Update Modal - Compact */}

      {isPaymentModalOpen && selectedBillForPayment && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Update Payment</h3>
        <button onClick={closePaymentModal} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Bill: <span className="font-semibold">{selectedBillForPayment.bill_number}</span></p>
          <p className="text-gray-600 mb-2">Customer: <span className="font-semibold">{selectedBillForPayment.customer_name}</span></p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-lg font-bold">₹{parseFloat(selectedBillForPayment.total_amount).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Due Amount</p>
              <p className="text-lg font-bold text-red-600">₹{parseFloat(selectedBillForPayment.due_amount).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount (₹)
          </label>
          <input
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter payment amount"
            max={selectedBillForPayment.due_amount}
            step="0.01"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum: ₹{parseFloat(selectedBillForPayment.due_amount).toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={closePaymentModal}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePaymentUpdate}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            Update Payment
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* View Bill Modal - Compact */}
       {isViewModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FileDigit className="w-5 h-5" />
                  Bill Details - {selectedBill.org_name}
                </h3>
                <p className="text-sm text-gray-600">{selectedBill.bill_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadInvoice(selectedBill)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                
                <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700 ml-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Invoice Content for Download */}
              <div id="invoice-content" className="p-6 bg-white">
                
                {/* Organization Header */}
                <div className="text-center mb-6 border-b pb-6">
                  {selectedBill.org_logo && (
                    <img 
                      src={selectedBill.org_logo} 
                      alt={selectedBill.org_name}
                      className="h-16 mx-auto mb-4"
                    />
                  )}
                  <h1 className="text-2xl font-bold text-gray-900">{selectedBill.org_name}</h1>
                  <div className="text-gray-600 mt-2">
                    <p>{selectedBill.address}</p>
                    <div className="flex justify-center gap-4 mt-2 text-sm">
                      {selectedBill.primary_phone && <span>Phone: {selectedBill.primary_phone}</span>}
                      {selectedBill.secondary_phone && <span>Alt: {selectedBill.secondary_phone}</span>}
                    </div>
                    <div className="mt-2">
                      {selectedBill.gst_number && (
                        <p className="font-medium">GSTIN: {selectedBill.gst_number}</p>
                      )}
                      {selectedBill.gst_type && (
                        <p className="text-sm">GST Type: {selectedBill.gst_type}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invoice Title */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">TAX INVOICE</h2>
                  <p className="text-gray-600 mt-2">#{selectedBill.bill_number}</p>
                </div>

                {/* Billing Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Bill To:</h3>
                    <p className="font-medium text-lg">{selectedBill.customer_name}</p>
                    {selectedBill.customer_phone && <p className="mt-1">📞 {selectedBill.customer_phone}</p>}
                    {selectedBill.customer_email && <p className="mt-1">✉️ {selectedBill.customer_email}</p>}
                    {selectedBill.customer_address && (
                      <p className="mt-2 text-gray-700">{selectedBill.customer_address}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Invoice Details:</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Invoice Date:</span> {new Date(selectedBill.created_at).toLocaleDateString()}</p>
                      <p><span className="font-medium">Invoice Time:</span> {new Date(selectedBill.created_at).toLocaleTimeString()}</p>
                      <p><span className="font-medium">Payment Method:</span> {selectedBill.payment_method.toUpperCase()}</p>
                      <p><span className="font-medium">Issued By:</span> {selectedBill.created_by_name}</p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full border-collapse border border-gray-300 mb-8">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left font-semibold">Sr.</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Product</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">SKU</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Price (₹)</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Qty</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, index) => (
                      <tr key={item.bill_item_id}>
                        <td className="border border-gray-300 p-3 text-center">{index + 1}</td>
                        <td className="border border-gray-300 p-3">
                          <div className="font-medium">{item.product_name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                          )}
                        </td>
                        <td className="border border-gray-300 p-3">{item.sku}</td>
                        <td className="border border-gray-300 p-3 text-right">{parseFloat(item.unit_price).toLocaleString('en-IN')}</td>
                        <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 p-3 text-right font-medium">{parseFloat(item.total_price).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals with GST */}
                <div className="ml-auto max-w-md">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Subtotal:</span>
                      <span>₹{parseFloat(selectedBill.subtotal).toLocaleString('en-IN')}</span>
                    </div>
                    
                    {selectedBill.discount_amount > 0 && (
                      <div className="flex justify-between border-b pb-2 text-red-600">
                        <span>Discount:</span>
                        <span>-₹{parseFloat(selectedBill.discount_amount).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                   
                    
                    {selectedBill.tax_amount > 0 && (
                      <>
                        <div className="flex justify-between border-b pb-2">
                          <span>Taxable Amount:</span>
                          <span>₹{(parseFloat(selectedBill.subtotal) - parseFloat(selectedBill.discount_amount)).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span>GST ({selectedBill.gst_percentage}%):</span>
                          <span>+₹{parseFloat(selectedBill.tax_amount).toLocaleString('en-IN')}</span>
                        </div>
                        {selectedBill.gst_type && (
                          <div className="text-xs text-gray-500 pl-4">
                            GST Type: {selectedBill.gst_type}
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-between font-bold text-lg pt-4 border-t-2">
                      <span>Grand Total:</span>
                      <span className="text-green-600">₹{parseFloat(selectedBill.total_amount).toLocaleString('en-IN')}</span>
                    </div>
                    {selectedBill.paid_amount && (
                      <div className="flex justify-between border-b pb-2 ">
                        <span>Paid Amount:</span>
                        <span>-₹{parseFloat(selectedBill.paid_amount).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {selectedBill.due_amount && (
                      <div className="flex justify-between border-b pb-2 ">
                        <span>Due Amount:</span>
                        <span>-₹{parseFloat(selectedBill.due_amount).toLocaleString('en-IN')}</span>
                      </div>
                    )}
            
                    {/* Amount in Words */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                      <span className="font-medium">Amount in Words:</span> 
                      <p className="mt-1">{amountInWords(selectedBill.total_amount)}</p>
                    </div>
                  </div>
                </div>

                {selectedBill.notes && (
                  <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
                    <p className="text-gray-700">{selectedBill.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-8 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Declaration</h4>
                      <p className="text-sm text-gray-600">
                        This is a computer-generated invoice and does not require a physical signature.
                      </p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-gray-800 mb-3">For {selectedBill.org_name}</h4>
                      <div className="mt-8">
                        <p className="text-sm text-gray-600">Authorized Signatory</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>Thank you for your business!</p>
                    <p className="mt-1">Invoice generated by {selectedBill.org_name} on {new Date().toLocaleDateString()}</p>
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

// Helper function to convert amount to words
const amountInWords = (num) => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  
  const b = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const convertToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertToWords(n % 100) : '');
    if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '');
    if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '');
    return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '');
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let words = convertToWords(rupees) + ' Rupees';
  if (paise > 0) {
    words += ' and ' + convertToWords(paise) + ' Paise';
  }
  
  return words + ' Only';
};


export default BillingManagement;