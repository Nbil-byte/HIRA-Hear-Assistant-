// backend/src/routes/stats.js
import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/api/stats', async (req, res) => {
  try {
    // Get today's sales with proper date formatting
    const today = new Date().toISOString().split('T')[0];
    const todaySales = await db.get(
      "SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE date >= ?",
      [today]
    );

    // Get total sales with null check
    const totalSales = await db.get(
      "SELECT COALESCE(SUM(total), 0) as total FROM orders"
    );

    // Get popular items with price information
    const orders = await db.all('SELECT items FROM orders');
    const itemCounts = {};
    let totalItemSales = {};

    orders.forEach(order => {
      const items = JSON.parse(order.items);
      items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        totalItemSales[item.name] = item.price;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ 
        name, 
        count,
        price: totalItemSales[name] || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      todaySales: todaySales.total || 0,
      totalSales: totalSales.total || 0,
      popularItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add clear orders endpoint
router.delete('/api/orders/clear', async (req, res) => {
  try {
    await db.run('DELETE FROM orders');
    res.json({ message: 'Order history cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;