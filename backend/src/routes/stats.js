// backend/src/routes/stats.js
import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/api/stats', async (req, res) => {
  try {
    // Get today's sales
    const today = new Date().toISOString().split('T')[0];
    const todaySales = await db.get(
      "SELECT SUM(total) as total FROM orders WHERE date >= ?",
      [today]
    );

    // Get total sales
    const totalSales = await db.get("SELECT SUM(total) as total FROM orders");

    // Get popular items
    const orders = await db.all('SELECT items FROM orders');
    const itemCounts = {};
    orders.forEach(order => {
      JSON.parse(order.items).forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
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

export default router;