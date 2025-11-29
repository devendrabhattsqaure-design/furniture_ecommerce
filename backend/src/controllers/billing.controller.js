const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Create a new bill
// @route   POST /api/bills
exports.createBill = asyncHandler(async (req, res) => {
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
    notes
  } = req.body;

  // Validation
  if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Customer name and at least one item are required'
    });
  }

  // Calculate totals
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
      'SELECT product_name, price, stock_quantity FROM products WHERE product_id = ?',
      [item.product_id]
    );

    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Product with ID ${item.product_id} not found`
      });
    }

    const product = products[0];
    
    // Check stock availability
    if (product.stock_quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.product_name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`
      });
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;
    totalQuantity += item.quantity;
  }

  // Calculate discount
  let discount = 0;
  if (discount_amount) {
    discount = parseFloat(discount_amount);
  } else if (discount_percentage) {
    discount = (subtotal * parseFloat(discount_percentage)) / 100;
  }

  // Calculate tax
  let tax = 0;
  if (tax_amount) {
    tax = parseFloat(tax_amount);
  } else if (tax_percentage) {
    tax = (subtotal * parseFloat(tax_percentage)) / 100;
  }

  const total_amount = subtotal - discount + tax;

  // Generate bill number (you can customize this logic)
  const billNumber = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Start transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Create bill
    const [billResult] = await connection.query(
      `INSERT INTO bills (
        bill_number, customer_name, customer_phone, customer_email, customer_address,
        subtotal, discount_amount, tax_amount, total_amount, total_quantity,
        payment_method, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        billNumber,
        customer_name,
        customer_phone || null,
        customer_email || null,
        customer_address || null,
        subtotal,
        discount,
        tax,
        total_amount,
        totalQuantity,
        payment_method || 'cash',
        notes || null,
        req.user.id
      ]
    );

    const billId = billResult.insertId;

    // Create bill items and update product stock
    for (const item of items) {
      // Get product details
      const [products] = await connection.query(
        'SELECT product_name, price, stock_quantity FROM products WHERE product_id = ?',
        [item.product_id]
      );
      const product = products[0];

      // Create bill item
      await connection.query(
        `INSERT INTO bill_items (
          bill_id, product_id, product_name, quantity, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          billId,
          item.product_id,
          product.product_name,
          item.quantity,
          product.price,
          product.price * item.quantity
        ]
      );

      // Update product stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Commit transaction
    await connection.commit();
    connection.release();

    // Get the complete bill with items
    const [bills] = await db.query(`
      SELECT b.*, u.full_name as created_by_name
      FROM bills b
      LEFT JOIN users u ON b.created_by = u.user_id
      WHERE b.bill_id = ?
    `, [billId]);

    const [billItems] = await db.query(`
      SELECT bi.*, p.product_name, p.sku
      FROM bill_items bi
      LEFT JOIN products p ON bi.product_id = p.product_id
      WHERE bi.bill_id = ?
    `, [billId]);

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
    // Rollback transaction in case of error
    await connection.rollback();
    connection.release();
    
    console.error('Error creating bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bill'
    });
  }
});

// @desc    Get all bills
// @route   GET /api/bills
exports.getAllBills = asyncHandler(async (req, res) => {
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
    WHERE 1=1
  `;
  const params = [];

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
      WHERE bi.bill_id = ?
    `, [bill.bill_id]);
    bill.items = items;
  }

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM bills WHERE 1=1';
  const countParams = [];

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

// @desc    Get single bill
// @route   GET /api/bills/:id
exports.getBill = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [bills] = await db.query(`
    SELECT b.*, u.full_name as created_by_name
    FROM bills b
    LEFT JOIN users u ON b.created_by = u.user_id
    WHERE b.bill_id = ?
  `, [id]);

  if (bills.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found'
    });
  }

  const [items] = await db.query(`
    SELECT bi.*, p.product_name, p.sku, p.description
    FROM bill_items bi
    LEFT JOIN products p ON bi.product_id = p.product_id
    WHERE bi.bill_id = ?
  `, [id]);

  const billData = {
    ...bills[0],
    items
  };

  res.json({
    success: true,
    data: billData
  });
});

// @desc    Search products for billing
// @route   GET /api/bills/products/search
exports.searchProducts = asyncHandler(async (req, res) => {
  const { search, category_id } = req.query;

  let query = `
    SELECT product_id, product_name, sku, price, stock_quantity, 
           description, category_id
    FROM products 
    WHERE is_active = TRUE AND stock_quantity > 0
  `;
  const params = [];

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

// @desc    Get billing statistics
// @route   GET /api/bills/statistics
exports.getBillingStatistics = asyncHandler(async (req, res) => {
  const { period = 'today' } = req.query; // today, week, month, year

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

  // Total sales
  const [totalSales] = await db.query(`
    SELECT 
      COUNT(*) as total_bills,
      SUM(total_amount) as total_revenue,
      SUM(total_quantity) as total_items_sold,
      AVG(total_amount) as average_bill_value
    FROM bills 
    WHERE ${dateFilter}
  `);

  // Today's bills count
  const [todayBills] = await db.query(`
    SELECT COUNT(*) as count 
    FROM bills 
    WHERE DATE(created_at) = CURDATE()
  `);

  // Payment method distribution
  const [paymentMethods] = await db.query(`
    SELECT 
      payment_method,
      COUNT(*) as count,
      SUM(total_amount) as amount
    FROM bills 
    WHERE ${dateFilter}
    GROUP BY payment_method
  `);

  // Top selling products
  const [topProducts] = await db.query(`
    SELECT 
      p.product_name,
      SUM(bi.quantity) as total_sold,
      SUM(bi.total_price) as total_revenue
    FROM bill_items bi
    JOIN products p ON bi.product_id = p.product_id
    JOIN bills b ON bi.bill_id = b.bill_id
    WHERE ${dateFilter.replace('created_at', 'b.created_at')}
    GROUP BY p.product_id, p.product_name
    ORDER BY total_sold DESC
    LIMIT 5
  `);

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