import express from 'express';
import multer from 'multer';
import path from 'path';
import { storageBucket, FOLDERS } from '../config/storage.js';
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
          `https://storage.googleapis.com/${storageBucket.name}/${FOLDERS.UPLOADS}/${path.basename(item.image_url)}`
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

    let imageUrl = null;
    
    if (req.file) {
      try {
        // Generate unique filename
        const filename = `menu-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(req.file.originalname)}`;
        
        // Reference to GCS file
        const file = storageBucket.file(`${FOLDERS.UPLOADS}/${filename}`);

        // Upload options with content type
        const options = {
          metadata: {
            contentType: req.file.mimetype
          }
        };

        // Upload file
        await file.save(req.file.buffer, options);
        
        // Generate signed URL or use direct public URL depending on bucket config
        imageUrl = `https://storage.googleapis.com/${storageBucket.name}/${FOLDERS.UPLOADS}/${filename}`;
        
        console.log('Image uploaded successfully:', imageUrl);
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
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

    let updateFields = { name, price, description, category };

    if (req.file) {
      const filename = `menu-${Date.now()}${path.extname(req.file.originalname || '.jpg')}`;
      const file = storageBucket.file(`${FOLDERS.UPLOADS}/${filename}`);

      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype }
      });

      await file.makePublic();
      updateFields.image_url = `https://storage.googleapis.com/${storageBucket.name}/${FOLDERS.UPLOADS}/${filename}`;
    }

    await db.run(
      'UPDATE menu SET name=?, price=?, description=?, category=?, image_url=COALESCE(?, image_url) WHERE id=?',
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