import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

const storage = new Storage();

export async function getTranscriptionText(filename) {
  try {
    const bucket = storage.bucket(process.env.CLOUD_BUCKET_NAME);
    const file = bucket.file(`transcribed-audio/${filename}`);
    
    const [content] = await file.download();
    return content.toString('utf-8');
  } catch (error) {
    console.error('Error fetching transcription:', error);
    throw error;
  }
}

export function preprocessText(text, vocab) {
  const MAX_LENGTH = 20;
  const tokens = text.toLowerCase()
    .split(/\s+/)
    .map(word => vocab[word] || 0);
  
  while (tokens.length < MAX_LENGTH) tokens.push(0);
  return tokens.slice(0, MAX_LENGTH);
}

export function postprocessPredictions(predictions, menuItems) {
  return predictions.map((prob, idx) => {
    if (prob > 0.5 && menuItems[idx]) {
      return {
        id: menuItems[idx].id,
        name: menuItems[idx].name
      };
    }
    return null;
  }).filter(Boolean);
}