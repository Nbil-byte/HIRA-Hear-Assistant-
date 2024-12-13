import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { menuItems } from './src/config/menu.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testModel() {
  try {
    // Load model
    console.log('Loading model...');
    const model = await tf.loadLayersModel('file://./model-files/model.json');
    
    // Load vocab
    const vocabPath = path.join(process.cwd(), 'model-files', 'tokenizer_vocab.json');
    const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

    // Test sentences
    const testSentences = [
      'saya pesan satu espresso',
      'tolong buatkan dua cappuccino',
      'mau pesan gula aren satu',
      'saya mau coffee latte tiga',
      'pesan caramel macchiato dua'
    ];

    for (const text of testSentences) {
      console.log('\nTesting:', text);

      // Tokenize
      const tokens = text.toLowerCase()
        .split(/\s+/)
        .map(word => vocab[word] || 0);
      
      // Pad sequence
      while (tokens.length < 20) tokens.push(0);
      const paddedTokens = tokens.slice(0, 20);

      // Predict
      const tensorInput = tf.tensor2d([paddedTokens]);
      const prediction = await model.predict(tensorInput);
      const probabilities = Array.from(prediction.dataSync());

      // Process results
      const results = probabilities.map((prob, idx) => {
        if (prob > 0.5 && menuItems[idx]) {
          return {
            name: menuItems[idx].name,
            confidence: (prob * 100).toFixed(2) + '%'
          };
        }
        return null;
      }).filter(Boolean);

      console.log('Detected items:');
      console.table(results);

      // Cleanup
      tensorInput.dispose();
      prediction.dispose();
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testModel();