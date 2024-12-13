import * as tf from '@tensorflow/tfjs-node';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Validate environment variables
if (!process.env.MODEL_BUCKET) {
  throw new Error('MODEL_BUCKET environment variable is not set');
}

const storage = new Storage();
const bucketName = process.env.MODEL_BUCKET;
const MODEL_PATH = './model-files';

async function ensureModelDir() {
  if (!fs.existsSync(MODEL_PATH)) {
    fs.mkdirSync(MODEL_PATH, { recursive: true });
  }
}

async function downloadModelFiles() {
  try {
    await ensureModelDir();
    console.log(`Accessing bucket: ${bucketName}`);
    const bucket = storage.bucket(bucketName);
    
    console.log('Listing available files in bucket...');
    const [files] = await bucket.getFiles({ prefix: 'model-hira/' });
    files.forEach(file => console.log(`Found file: ${file.name}`));

    console.log('Downloading model files...');
    await bucket.file('model-hira/model.json').download({
      destination: path.join(MODEL_PATH, 'model.json')
    });
    console.log('Downloaded model.json');

    await bucket.file('model-hira/group1-shard1of1.bin').download({
      destination: path.join(MODEL_PATH, 'group1-shard1of1.bin')
    });
    console.log('Downloaded group1-shard1of1.bin');

    await bucket.file('model-hira/tokenizer_vocab.json').download({
      destination: path.join(MODEL_PATH, 'tokenizer_vocab.json')
    });
    console.log('Downloaded tokenizer_vocab.json');

    console.log('Model files downloaded successfully');
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

export async function loadModel() {
  try {
    await downloadModelFiles();
    const model = await tf.loadLayersModel(`file://${path.join(MODEL_PATH, 'model.json')}`);
    console.log('Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Model loading failed:', error);
    throw error;
  }
}

// Test only if running directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  loadModel()
    .then(() => console.log('Test complete'))
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}