// backend/src/routes/audio.js
import express from 'express';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import { SpeechClient } from '@google-cloud/speech';
import { storageBucket, FOLDERS } from '../config/storage.js';

const router = express.Router();
const speechClient = new SpeechClient();

// Use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('audio');

router.post('/api/audio', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    // 1. Upload audio to GCS
    const audioFilename = `order-${Date.now()}.webm`;
    const audioFile = storageBucket.file(`${FOLDERS.AUDIO_UPLOADS}/${audioFilename}`);

    await audioFile.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });
    
    // 2. Transcribe using Speech-to-Text
    const audio = {
      content: req.file.buffer.toString('base64'),
    };
    
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'id-ID',
    };

    const [response] = await speechClient.recognize({
      audio,
      config,
    });

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    // 3. Save transcription to GCS
    const textFilename = `transcript-${Date.now()}.txt`;
    const textFile = storageBucket.file(`${FOLDERS.TRANSCRIBED_TEXT}/${textFilename}`);
    
    await textFile.save(transcription);

    res.json({
      message: 'Processing complete',
      audioUrl: `https://storage.googleapis.com/${storageBucket.name}/${FOLDERS.AUDIO_UPLOADS}/${audioFilename}`,
      transcription
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;