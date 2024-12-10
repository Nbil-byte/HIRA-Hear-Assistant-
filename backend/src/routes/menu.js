import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { db } from '../db.js';

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get all menu items
router.get('/api/menu', async (req, res) => {
  try {
    const items = await db.all('SELECT * FROM menu');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new menu item
router.post('/api/menu', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    
    // Validate inputs
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    let imageUrl = '';
    if (req.file) {
      // Fix image URL to use absolute path
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Ensure category exists or set default
    const validCategory = category || 'coffee';

    const result = await db.run(
      'INSERT INTO menu (name, price, description, image_url, category) VALUES (?, ?, ?, ?, ?)',
      [name, parseFloat(price), description || '', imageUrl, validCategory]
    );

    res.status(201).json({ id: result.lastID });
  } catch (error) {
    console.error('Menu creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update menu item
router.put('/api/menu/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const { id } = req.params;

    let updateFields = { name, price, description, category };

    if (req.file) {
      updateFields.image_url = `/uploads/${req.file.filename}`;
    }

    await db.run(
      'UPDATE menu SET name=?, price=?, description=?, category=?, image_url=? WHERE id=?',
      [updateFields.name, updateFields.price, updateFields.description, updateFields.category, updateFields.image_url, id]
    );

    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete menu item
router.delete('/api/menu/:id', async (req, res) => {
  try {
    // Get menu data first to get image URL
    const menu = await db.get('SELECT * FROM menu WHERE id = ?', [req.params.id]);
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Delete image file if exists
    if (menu.image_url) {
      const imagePath = path.join(process.cwd(), menu.image_url);
      try {
        await fs.access(imagePath); // Check if file exists
        await fs.unlink(imagePath); // Delete file
      } catch (err) {
        console.warn('Image file not found:', imagePath);
      }
    }

    // Delete menu from database
    await db.run('DELETE FROM menu WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Menu and image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;