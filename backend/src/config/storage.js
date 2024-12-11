// backend/src/config/storage.js
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const requiredEnvVars = [
  'GOOGLE_CLOUD_PROJECT',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'STORAGE_BUCKET'
];

// Check for required environment variables
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Initialize storage with explicit credentials
const storage = new Storage({
  keyFilename: path.resolve(__dirname, '../../serviceaccount.json'),
  projectId: process.env.GOOGLE_CLOUD_PROJECT
});

const bucketName = process.env.STORAGE_BUCKET;
const storageBucket = storage.bucket(bucketName);

const FOLDERS = {
  UPLOADS: 'uploads',
  AUDIO_UPLOADS: 'audio-uploads',
  TRANSCRIBED_TEXT: 'transcribed-audio'
};

const initializeStorage = async () => {
  try {
    // Test authentication
    await storage.auth.getClient();
    console.log('Authentication successful');

    // Check bucket exists
    const [exists] = await storageBucket.exists();
    if (!exists) {
      console.log(`Creating bucket ${bucketName}...`);
      await storage.createBucket(bucketName, {
        uniformBucketLevelAccess: true,
        publicAccessPrevention: 'enforced'
      });
    }

    // Initialize folders
    for (const folder of Object.values(FOLDERS)) {
      const file = storageBucket.file(`${folder}/.keep`);
      try {
        await file.save('');
        console.log(`Initialized folder: ${folder}`);
      } catch (err) {
        console.warn(`Failed to initialize folder ${folder}:`, err.message);
      }
    }

    console.log('Storage initialization complete');
    return true;
  } catch (error) {
    console.error('Storage initialization failed:', error);
    throw error;
  }
};

const checkPermissions = async () => {
  try {
    await storageBucket.iam.test(); // Test bucket permissions
    console.log('Storage permissions OK');
  } catch (error) {
    console.error('Storage permission error:', error);
  }
};

// Add bucket initialization verification
const verifyBucketAccess = async () => {
  try {
    const [exists] = await storageBucket.exists();
    if (!exists) {
      throw new Error(`Bucket ${bucketName} does not exist`);
    }
    console.log('Storage bucket verified:', bucketName);
  } catch (error) {
    console.error('Bucket verification failed:', error);
    throw error;
  }
};

// Export the verification function
export { storage, storageBucket, FOLDERS, initializeStorage, verifyBucketAccess };