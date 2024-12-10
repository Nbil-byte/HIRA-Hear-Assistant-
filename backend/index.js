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

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const audioDir = path.join(__dirname, 'audio-uploads');
if (!fs.existsSync(audioDir)){
    fs.mkdirSync(audioDir, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());
// Fix static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', menuRoutes);
app.use('/', audioRoutes);
app.use('/', ordersRoutes);
app.use('/', statsRoutes);

const startServer = async () => {
  await initializeDB();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);