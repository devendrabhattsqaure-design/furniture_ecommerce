const db = require('../../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard/stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalOrders] = await db.query('SELECT COUNT(*) as count FROM orders');
  const [totalRevenue] = await db.query('SELECT SUM(total_amount) as total FROM orders WHERE order_status NOT IN ("cancelled", "failed")');
  const [totalProducts] = await db.query('SELECT COUNT(*) as count FROM products WHERE is_active = TRUE');
  const [totalCustomers] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
  const [pendingOrders] = await db.query('SELECT COUNT(*) as count FROM orders WHERE order_status = "pending"');
  const [lowStockProducts] = await db.query('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= low_stock_threshold');

  const [recentOrders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10');

  const [topProducts] = await db.query(`
    SELECT p.product_name, p.sku, SUM(oi.quantity) as total_sold
    FROM products p
    JOIN order_items oi ON p.product_id = oi.product_id
    GROUP BY p.product_id
    ORDER BY total_sold DESC
    LIMIT 5
  `);

  res.json({
    success: true,
    data: {
      stats: {
        totalOrders: totalOrders[0].count,
        totalRevenue: totalRevenue[0].total || 0,
        totalProducts: totalProducts[0].count,
        totalCustomers: totalCustomers[0].count,
        pendingOrders: pendingOrders[0].count,
        lowStockProducts: lowStockProducts[0].count
      },
      recentOrders,
      topProducts
    }
  });
});

// @desc    Get sales chart data
// @route   GET /api/admin/dashboard/sales-chart
exports.getSalesChart = asyncHandler(async (req, res) => {
  const { period = '7days' } = req.query;

  let dateFilter = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
  if (period === '30days') dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
  if (period === '12months') dateFilter = 'DATE_SUB(NOW(), INTERVAL 12 MONTH)';

  const [salesData] = await db.query(`
    SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue
    FROM orders
    WHERE created_at >= ${dateFilter} AND order_status NOT IN ('cancelled', 'failed')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  res.json({ success: true, data: salesData });
});
