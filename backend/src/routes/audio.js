import express from 'express';
import multer from 'multer';
import { db } from '../db.js';
import { bucket, speechClient, FOLDERS } from '../config/storage.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/api/audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Generate unique filename
    const audioFileName = `audio-${Date.now()}.webm`;
    const audioFilePath = `${FOLDERS.AUDIO_UPLOADS}/${audioFileName}`;
    
    // Upload to Cloud Storage
    const audioFile = bucket.file(audioFilePath);
    await audioFile.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    // Get public URL
    const audioUrl = `https://storage.googleapis.com/${bucket.name}/${audioFilePath}`;

    // Configure Speech-to-Text
    const audio = {
      content: req.file.buffer.toString('base64')
    };
    
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'id-ID',
    };

    // Perform transcription
    const [response] = await speechClient.recognize({ audio, config });
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    // Save transcription to Cloud Storage
    const transcriptionFileName = `transcript-${Date.now()}.txt`;
    const transcriptionFilePath = `${FOLDERS.TRANSCRIBED_TEXT}/${transcriptionFileName}`;
    const transcriptionFile = bucket.file(transcriptionFilePath);
    await transcriptionFile.save(transcription);

    res.json({
      success: true,
      audioUrl,
      transcription,
      transcriptionUrl: `https://storage.googleapis.com/${bucket.name}/${transcriptionFilePath}`
    });

  } catch (error) {
    console.error('Audio processing error:', error);
    res.status(500).json({
      error: 'Audio processing failed',
      details: error.message
    });
  }
});

router.post('/api/voice-order', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // 1. Save audio to Cloud Storage
    const audioFileName = `audio-${Date.now()}.webm`;
    const audioFilePath = `${FOLDERS.AUDIO_UPLOADS}/${audioFileName}`;
    
    const audioFile = bucket.file(audioFilePath);
    await audioFile.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    // 2. Transcribe audio
    const audio = {
      content: req.file.buffer.toString('base64')
    };
    
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'id-ID',
    };

    const [response] = await speechClient.recognize({ audio, config });
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    // 3. Save transcription
    const transcriptionFileName = `transcript-${Date.now()}.txt`;
    const transcriptionFilePath = `${FOLDERS.TRANSCRIBED_TEXT}/${transcriptionFileName}`;
    const transcriptionFile = bucket.file(transcriptionFilePath);
    await transcriptionFile.save(transcription);

    // 4. Match menu items in transcription
    const menus = await db.all('SELECT * FROM menu');
    const matchedItems = [];
    
    const transcriptionLower = transcription.toLowerCase();
    for (const menu of menus) {
      const menuNameLower = menu.name.toLowerCase();
      if (transcriptionLower.includes(menuNameLower)) {
        // Extract quantity if present (e.g., "2 espresso" or "two espresso")
        const numberWords = ['satu', 'dua', 'tiga', 'empat', 'lima'];
        const numberRegex = new RegExp(`(\\d+|${numberWords.join('|')})\\s+${menuNameLower}`);
        const match = transcriptionLower.match(numberRegex);
        
        let quantity = 1;
        if (match) {
          const numberStr = match[1];
          quantity = numberWords.includes(numberStr) ? 
            numberWords.indexOf(numberStr) + 1 : 
            parseInt(numberStr);
        }

        matchedItems.push({
          ...menu,
          quantity
        });
      }
    }

    res.json({
      success: true,
      transcription,
      matchedItems,
      audioUrl: `https://storage.googleapis.com/${bucket.name}/${audioFilePath}`,
      transcriptionUrl: `https://storage.googleapis.com/${bucket.name}/${transcriptionFilePath}`
    });

  } catch (error) {
    console.error('Voice order processing error:', error);
    res.status(500).json({ error: 'Voice order processing failed' });
  }
});

export default router;