const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// Helper to get organization ID
const getOrgId = (req) => {
  return req.user?.org_id || req.headers['x-org-id'] || null;
};

// Update the createBill function to handle partial payments
exports.createBill = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  const { 
    customer_name, 
    customer_phone, 
    customer_email, 
    customer_address,
    items, 
    discount_amount, 
    discount_percentage, 
    tax_amount, 
    tax_percentage,
    payment_method,
    notes,
    paid_amount, // Add this
    due_date // Add this
  } = req.body;

  // Validation (existing code remains)
  if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Customer name and at least one item are required'
    });
  }

  // Get organization details (existing code)
  const [orgs] = await db.query(
    'SELECT * FROM organizations WHERE org_id = ?',
    [orgId]
  );
  
  if (orgs.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Organization not found'
    });
  }

  const organization = orgs[0];

  // Calculate totals - FIXED CALCULATION
  let subtotal = 0;
  let totalQuantity = 0;

  // Validate items and calculate subtotal
  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Each item must have a valid product and quantity'
      });
    }

    // Get product price and stock
    const [products] = await db.query(
      'SELECT product_name, price, stock_quantity FROM products WHERE product_id = ? AND org_id = ?',
      [item.product_id, orgId]
    );

    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Product with ID ${item.product_id} not found in your organization`
      });
    }

    const product = products[0];
    
    // Check stock
    if (product.stock_quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.product_name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`
      });
    }

    const itemTotal = parseFloat(product.price) * parseInt(item.quantity); // Ensure proper type conversion
    subtotal += itemTotal;
    totalQuantity += parseInt(item.quantity);
  }

  // Apply tax
  let tax = 0;
  if (tax_amount) {
    tax = parseFloat(tax_amount);
  } else if (tax_percentage) {
    tax = (subtotal * parseFloat(tax_percentage)) / 100;
  } else if (organization.gst_percentage > 0) {
    tax = (subtotal * parseFloat(organization.gst_percentage)) / 100;
  }

  // Calculate discount
  let discount = 0;
  if (discount_amount) {
    discount = parseFloat(discount_amount);
  } else if (discount_percentage) {
    discount = (subtotal * parseFloat(discount_percentage)) / 100;
  }

  const total_amount = parseFloat((subtotal - discount + tax).toFixed(2));
  
  // Handle payment
  const paidAmount = parseFloat(paid_amount || total_amount);
  const dueAmount = parseFloat((total_amount - paidAmount).toFixed(2));
  
  let payment_status = 'paid';
  if (dueAmount === total_amount) {
    payment_status = 'pending';
  } else if (dueAmount > 0) {
    payment_status = 'partial';
  }

  // Generate bill number (existing code)
  const generateBillNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random4 = Math.floor(1000 + Math.random() * 9000);
    const orgPrefix = organization.org_name.substring(0, 3).toUpperCase();
    return `${orgPrefix}-${year}${month}${day}-${random4}`;
  };

  const billNumber = generateBillNumber();

  // Start transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Create bill with payment fields
    const [billResult] = await connection.query(
      `INSERT INTO bills (
        bill_number, customer_name, customer_phone, customer_email, customer_address,
        subtotal, discount_amount, tax_amount, total_amount, total_quantity,
        payment_method, notes, created_by, org_id,
        paid_amount, due_amount, payment_status, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        billNumber,
        customer_name,
        customer_phone || null,
        customer_email || null,
        customer_address || null,
        subtotal.toFixed(2),
        discount.toFixed(2),
        tax.toFixed(2),
        total_amount,
        totalQuantity,
        payment_method || 'cash',
        notes || null,
        req.user.id,
        orgId,
        paidAmount.toFixed(2),
        dueAmount.toFixed(2),
        payment_status,
        due_date || null
      ]
    );

    const billId = billResult.insertId;

    // Create bill items (existing code)
    for (const item of items) {
      const [products] = await connection.query(
        'SELECT product_name, price, stock_quantity FROM products WHERE product_id = ? AND org_id = ?',
        [item.product_id, orgId]
      );
      const product = products[0];

      await connection.query(
        `INSERT INTO bill_items (
          bill_id, product_id, product_name, quantity, unit_price, total_price, org_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          billId,
          item.product_id,
          product.product_name,
          item.quantity,
          parseFloat(product.price).toFixed(2),
          (parseFloat(product.price) * parseInt(item.quantity)).toFixed(2),
          orgId
        ]
      );

      // Update product stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND org_id = ?',
        [item.quantity, item.product_id, orgId]
      );
    }

    // Commit transaction
    await connection.commit();
    connection.release();

    // Get the complete bill
    const [bills] = await db.query(`
      SELECT b.*, u.full_name as created_by_name, o.*
      FROM bills b
      LEFT JOIN users u ON b.created_by = u.user_id
      LEFT JOIN organizations o ON b.org_id = o.org_id
      WHERE b.bill_id = ? AND b.org_id = ?
    `, [billId, orgId]);

    const [billItems] = await db.query(`
      SELECT bi.*, p.product_name, p.sku
      FROM bill_items bi
      LEFT JOIN products p ON bi.product_id = p.product_id
      WHERE bi.bill_id = ? AND bi.org_id = ?
    `, [billId, orgId]);

    const billData = {
      ...bills[0],
      items: billItems
    };

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: billData
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    
    console.error('Error creating bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bill'
    });
  }
});

// Update your billing.controller.js - updatePayment function
exports.updatePayment = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { id } = req.params;
  const { paid_amount, payment_amount } = req.body;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  if (!paid_amount || paid_amount < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid paid amount is required'
    });
  }

  // Get current bill
  const [bills] = await db.query(
    'SELECT * FROM bills WHERE bill_id = ? AND org_id = ?',
    [id, orgId]
  );

  if (bills.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found'
    });
  }

  const bill = bills[0];
  const newPaidAmount = parseFloat(paid_amount);
  const totalAmount = parseFloat(bill.total_amount);
  const dueAmount = parseFloat((totalAmount - newPaidAmount).toFixed(2));
  
  // Validate paid amount
  if (newPaidAmount > totalAmount) {
    return res.status(400).json({
      success: false,
      message: `Paid amount cannot exceed total amount of ₹${totalAmount.toLocaleString('en-IN')}`
    });
  }
  
  let payment_status = 'paid';
  if (dueAmount === totalAmount) {
    payment_status = 'pending';
  } else if (dueAmount > 0) {
    payment_status = 'partial';
  }

  // Update payment
  await db.query(
    `UPDATE bills SET 
      paid_amount = ?, 
      due_amount = ?, 
      payment_status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE bill_id = ? AND org_id = ?`,
    [newPaidAmount.toFixed(2), dueAmount.toFixed(2), payment_status, id, orgId]
  );

  // Get updated bill
  const [updatedBills] = await db.query(`
    SELECT b.*, u.full_name as created_by_name, o.*
    FROM bills b
    LEFT JOIN users u ON b.created_by = u.user_id
    LEFT JOIN organizations o ON b.org_id = o.org_id
    WHERE b.bill_id = ? AND b.org_id = ?
  `, [id, orgId]);

  const [billItems] = await db.query(`
    SELECT bi.*, p.product_name, p.sku, p.description
    FROM bill_items bi
    LEFT JOIN products p ON bi.product_id = p.product_id
    WHERE bi.bill_id = ? AND bi.org_id = ?
  `, [id, orgId]);

  const billData = {
    ...updatedBills[0],
    items: billItems
  };

  res.json({
    success: true,
    message: 'Payment updated successfully',
    data: billData
  });
});
// @desc    Get all bills for current organization
// @route   GET /api/bills
exports.getAllBills = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  const { 
    page = 1, 
    limit = 20, 
    start_date, 
    end_date, 
    customer_name,
    bill_number,
    payment_method
  } = req.query;

  const offset = (page - 1) * limit;

  let query = `
    SELECT b.*, u.full_name as created_by_name
    FROM bills b
    LEFT JOIN users u ON b.created_by = u.user_id
    WHERE b.org_id = ?
  `;
  const params = [orgId];

  if (start_date && end_date) {
    query += ' AND DATE(b.created_at) BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }

  if (customer_name) {
    query += ' AND b.customer_name LIKE ?';
    params.push(`%${customer_name}%`);
  }

  if (bill_number) {
    query += ' AND b.bill_number LIKE ?';
    params.push(`%${bill_number}%`);
  }

  if (payment_method) {
    query += ' AND b.payment_method = ?';
    params.push(payment_method);
  }

  query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [bills] = await db.query(query, params);

  // Get items for each bill
  for (let bill of bills) {
    const [items] = await db.query(`
      SELECT bi.*, p.product_name, p.sku
      FROM bill_items bi
      LEFT JOIN products p ON bi.product_id = p.product_id
      WHERE bi.bill_id = ? AND bi.org_id = ?
    `, [bill.bill_id, orgId]);
    bill.items = items;
  }

  // Get total count for the organization
  let countQuery = 'SELECT COUNT(*) as total FROM bills WHERE org_id = ?';
  const countParams = [orgId];

  if (start_date && end_date) {
    countQuery += ' AND DATE(created_at) BETWEEN ? AND ?';
    countParams.push(start_date, end_date);
  }

  if (customer_name) {
    countQuery += ' AND customer_name LIKE ?';
    countParams.push(`%${customer_name}%`);
  }

  const [countResult] = await db.query(countQuery, countParams);
  const total = countResult[0].total;

  res.json({
    success: true,
    data: bills,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single bill for current organization
// @route   GET /api/bills/:id
// @desc    Get single bill
// @route   GET /api/bills/:id
exports.getBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = getOrgId(req);

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  const [bills] = await db.query(`
    SELECT 
      b.*, 
      u.full_name as created_by_name,
      o.org_name,
      o.org_logo,
      o.gst_number,
      o.gst_type,
      o.gst_percentage,
      o.address as org_address,
      o.contact_person_name,
      o.primary_phone,
      o.secondary_phone
    FROM bills b
    LEFT JOIN users u ON b.created_by = u.user_id
    LEFT JOIN organizations o ON b.org_id = o.org_id
    WHERE b.bill_id = ? AND b.org_id = ?
  `, [id, orgId]);

  if (bills.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found in your organization'
    });
  }

  const [items] = await db.query(`
    SELECT bi.*, p.product_name, p.sku, p.description
    FROM bill_items bi
    LEFT JOIN products p ON bi.product_id = p.product_id
    WHERE bi.bill_id = ? AND bi.org_id = ?
  `, [id, orgId]);

  const billData = {
    ...bills[0],
    items
  };

  res.json({
    success: true,
    data: billData
  });
});

// @desc    Search products for billing within organization
// @route   GET /api/bills/products/search
exports.searchProducts = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { search, category_id } = req.query;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  let query = `
    SELECT product_id, product_name, sku, price, stock_quantity, 
           description, category_id
    FROM products 
    WHERE org_id = ? AND is_active = TRUE AND stock_quantity > 0
  `;
  const params = [orgId];

  if (search) {
    query += ' AND (product_name LIKE ? OR sku LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (category_id) {
    query += ' AND category_id = ?';
    params.push(category_id);
  }

  query += ' ORDER BY product_name LIMIT 20';

  const [products] = await db.query(query, params);

  res.json({
    success: true,
    data: products
  });
});

// @desc    Get billing statistics for current organization
// @route   GET /api/bills/statistics
exports.getBillingStatistics = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { period = 'today' } = req.query;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  let dateFilter = '';
  const currentDate = new Date();

  switch (period) {
    case 'today':
      dateFilter = 'DATE(created_at) = CURDATE()';
      break;
    case 'week':
      dateFilter = 'YEARWEEK(created_at) = YEARWEEK(CURDATE())';
      break;
    case 'month':
      dateFilter = 'YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())';
      break;
    case 'year':
      dateFilter = 'YEAR(created_at) = YEAR(CURDATE())';
      break;
    default:
      dateFilter = 'DATE(created_at) = CURDATE()';
  }

  // Total sales for organization
  const [totalSales] = await db.query(`
    SELECT 
      COUNT(*) as total_bills,
      SUM(total_amount) as total_revenue,
      SUM(total_quantity) as total_items_sold,
      AVG(total_amount) as average_bill_value
    FROM bills 
    WHERE org_id = ? AND ${dateFilter}
  `, [orgId]);

  // Today's bills count for organization
  const [todayBills] = await db.query(`
    SELECT COUNT(*) as count 
    FROM bills 
    WHERE org_id = ? AND DATE(created_at) = CURDATE()
  `, [orgId]);

  // Payment method distribution for organization
  const [paymentMethods] = await db.query(`
    SELECT 
      payment_method,
      COUNT(*) as count,
      SUM(total_amount) as amount
    FROM bills 
    WHERE org_id = ? AND ${dateFilter}
    GROUP BY payment_method
  `, [orgId]);

  // Top selling products for organization
  const [topProducts] = await db.query(`
    SELECT 
      p.product_name,
      SUM(bi.quantity) as total_sold,
      SUM(bi.total_price) as total_revenue
    FROM bill_items bi
    JOIN products p ON bi.product_id = p.product_id
    JOIN bills b ON bi.bill_id = b.bill_id
    WHERE b.org_id = ? AND ${dateFilter.replace('created_at', 'b.created_at')}
    GROUP BY p.product_id, p.product_name
    ORDER BY total_sold DESC
    LIMIT 5
  `, [orgId]);

  const statistics = {
    total_bills: totalSales[0].total_bills || 0,
    total_revenue: totalSales[0].total_revenue || 0,
    total_items_sold: totalSales[0].total_items_sold || 0,
    average_bill_value: totalSales[0].average_bill_value || 0,
    today_bills: todayBills[0].count || 0,
    payment_methods: paymentMethods,
    top_products: topProducts
  };

  res.json({
    success: true,
    data: statistics
  });
});       