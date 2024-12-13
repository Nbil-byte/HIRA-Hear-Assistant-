import express from 'express';
import multer from 'multer';
import path from 'path';
import { FOLDERS, bucket as storageBucket } from '../config/storage.js';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs'; // Use fs promises API
import { db } from '../db.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize upload directory
const initializeUploads = async () => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
};

// Initialize directories
await initializeUploads();

const multerStorage = multer.memoryStorage();
const multerUpload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .jpg, .png and .webp format allowed!'), false);
    }
    cb(null, true);
  }
});

// Get all menu items
router.get('/api/menu', async (req, res) => {
  try {
    const items = await db.all('SELECT * FROM menu');
    
    // Transform image URLs to public URLs if needed
    const transformedItems = items.map(item => ({
      ...item,
      image_url: item.image_url ? 
        item.image_url.startsWith('http') ? 
          item.image_url : 
          `https://storage.googleapis.com/${storageBucket.name}/${FOLDERS.MENU_UPLOADS}/${path.basename(item.image_url)}`
      : null
    }));

    res.json(transformedItems);
  } catch (error) {
    console.error('Menu fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch menu items',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add new menu item
router.post('/api/menu', multerUpload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    
    // Input validation
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Validate file type and size before upload
    if (req.file && !['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Add file size validation
    if (req.file && req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large' });
    }

    let imageUrl = null;
    
    if (req.file) {
      // Generate unique filename
      const filename = `menu-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(req.file.originalname)}`;
      const filePath = `${FOLDERS.MENU_UPLOADS}/${filename}`;
      
      try {
        // Upload to GCS
        const file = storageBucket.file(filePath);
        await file.save(req.file.buffer, {
          metadata: {
            contentType: req.file.mimetype
          }
        });
        
        // Generate public URL
        imageUrl = `https://storage.googleapis.com/${storageBucket.name}/${filePath}`;
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        return res.status(500).json({
          error: 'Failed to upload image',
          details: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    }

    // Insert menu item into database
    const result = await db.run(
      'INSERT INTO menu (name, price, description, image_url, category) VALUES (?, ?, ?, ?, ?)',
      [name, parseFloat(price), description || '', imageUrl, category || 'coffee']
    );

    res.status(201).json({
      id: result.lastID,
      name,
      price,
      description,
      image_url: imageUrl,
      category
    });

  } catch (error) {
    console.error('Menu creation failed:', error);
    res.status(500).json({
      error: 'Failed to create menu item',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update menu item
router.put('/api/menu/:id', multerUpload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const { id } = req.params;

    // Get existing menu item
    const existingMenu = await db.get('SELECT * FROM menu WHERE id = ?', [id]);
    if (!existingMenu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    let imageUrl = existingMenu.image_url;

    // Handle new image upload
    if (req.file) {
      // Delete old image from cloud storage if exists
      if (existingMenu.image_url) {
        const oldImagePath = existingMenu.image_url.split('/').pop();
        try {
          await storageBucket.file(`${FOLDERS.MENU_UPLOADS}/${oldImagePath}`).delete();
        } catch (error) {
          console.warn('Failed to delete old image:', error);
        }
      }

      // Upload new image
      const filename = `menu-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(req.file.originalname)}`;
      const filePath = `${FOLDERS.MENU_UPLOADS}/${filename}`;
      const file = storageBucket.file(filePath);
      
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype }
      });

      imageUrl = `https://storage.googleapis.com/${storageBucket.name}/${filePath}`;
    }

    // Update menu item
    await db.run(
      'UPDATE menu SET name=?, price=?, description=?, category=?, image_url=? WHERE id=?',
      [name, price, description, category, imageUrl, id]
    );

    res.json({
      id,
      name,
      price,
      description,
      category,
      image_url: imageUrl
    });

  } catch (error) {
    console.error('Update failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete menu item
router.delete('/api/menu/:id', async (req, res) => {
  try {
    const menu = await db.get('SELECT * FROM menu WHERE id = ?', [req.params.id]);
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Delete image from cloud storage
    if (menu.image_url) {
      const imagePath = menu.image_url.split('/').pop();
      try {
        await storageBucket.file(`${FOLDERS.MENU_UPLOADS}/${imagePath}`).delete();
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
      }
    }

    // Delete menu from database
    await db.run('DELETE FROM menu WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Delete failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;