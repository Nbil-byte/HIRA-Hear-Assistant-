import express from 'express';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import multer from 'multer';
import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import { getTranscriptionText, preprocessText, postprocessPredictions } from '../utils/textProcessing.js';
import { menuItems } from '../config/menu.js';

const router = express.Router();
const storage = new Storage();
const upload = multer();

// Load vocabulary once
const vocabPath = path.join(process.cwd(), 'tokenizer_vocab.json');
let vocab = null;

async function loadVocab(bucket) {
  try {
    const [content] = await bucket.file('model-hira/tokenizer_vocab.json').download();
    vocab = JSON.parse(content.toString());
    return vocab;
  } catch (error) {
    console.error('Error loading vocabulary:', error);
    throw error;
  }
}

function tokenizeText(text, vocab) {
  const maxLength = 20;
  const tokens = text.toLowerCase()
    .split(/\s+/)
    .map(word => vocab[word] || 0);
  
  while (tokens.length < maxLength) tokens.push(0);
  return tokens.slice(0, maxLength);
}

export default function createPredictionRouter(model) {
  router.post('/process-order', async (req, res) => {
    try {
      const { text } = req.body;
      
      // Preprocess text
      const tokens = preprocessText(text, vocab);
      
      // Make prediction
      const tensorInput = tf.tensor2d([tokens]);
      const prediction = await model.predict(tensorInput);
      const probabilities = Array.from(prediction.dataSync());
      
      // Process predictions to get only menu names
      const detectedItems = postprocessPredictions(probabilities, menuItems);
      
      // Cleanup
      tensorInput.dispose();
      prediction.dispose();

      res.json({ items: detectedItems });
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/audio', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }

      // For testing, return dummy response
      // TODO: Implement actual audio processing
      const dummyResponse = {
        success: true,
        message: 'Audio processed successfully',
        predictions: [
          { name: "Espresso", price: 25000, quantity: 2 },
          { name: "Latte", price: 35000, quantity: 1 }
        ]
      };

      res.json(dummyResponse);
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ 
        error: 'Prediction failed',
        details: error.message 
      });
    }
  });

  return router;
}