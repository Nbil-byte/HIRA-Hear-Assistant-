import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDB } from './src/db.js';
import menuRoutes from './src/routes/menu.js';
import audioRoutes from './src/routes/audio.js';
import ordersRoutes from './src/routes/orders.js';
import statsRoutes from './src/routes/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Update CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use((req, res, next) => {
  if (req.body) console.log('Request body:', JSON.stringify(req.body, null, 2));
  next();
});
app.use(express.json());
app.use('/', audioRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', menuRoutes);
app.use('/', ordersRoutes);
app.use('/', statsRoutes);

const startServer = async () => {
  try {
    await initializeDB();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer().catch(console.error);