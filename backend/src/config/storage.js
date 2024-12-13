// backend/src/config/storage.js
import { Storage } from '@google-cloud/storage';
import { SpeechClient } from '@google-cloud/speech';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate bucket name
if (!process.env.CLOUD_BUCKET_NAME) {
  throw new Error('CLOUD_BUCKET_NAME environment variable is required');
}

// Initialize Storage with credentials
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_PROJECT_ID || 'hira-444406'
});

const bucket = storage.bucket(process.env.CLOUD_BUCKET_NAME);

// Initialize Speech Client
const speechClient = new SpeechClient();

// Define folder structure
export const FOLDERS = {
  MENU_UPLOADS: 'uploads',
  AUDIO_UPLOADS: 'audio-uploads',
  TRANSCRIBED_TEXT: 'transcribed-audio'
};

// Single export statement for all config
export { storage, bucket, speechClient };