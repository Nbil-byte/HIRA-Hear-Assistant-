// backend/src/routes/orders.js
import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.post('/api/orders', async (req, res) => {
  try {
    const { items, note } = req.body;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const result = await db.run(
      'INSERT INTO orders (total, note, items) VALUES (?, ?, ?)',
      [total, note, JSON.stringify(items)]
    );

    res.status(201).json({ id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.all('SELECT * FROM orders ORDER BY date DESC');
    res.json(orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;