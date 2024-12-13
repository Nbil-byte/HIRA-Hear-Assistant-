import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { loadModel } from './src/utils/modelLoader.js';
import createPredictionRouter from './src/routes/prediction.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(helmet());
app.use(limiter);

async function startServer() {
  try {
    console.log('Loading model...');
    const model = await loadModel();
    console.log('Model loaded successfully');

    // Add root path handler
    app.get('/', (req, res) => {
      res.json({ status: 'Model API is running' });
    });

    // Mount prediction router
    app.use('/api', createPredictionRouter(model));

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Model API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
}

startServer();