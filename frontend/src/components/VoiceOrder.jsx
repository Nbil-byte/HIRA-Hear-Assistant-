// frontend/src/components/VoiceOrder.jsx
import { useState } from 'react';
import axios from 'axios';

const VoiceOrder = ({ onOrdersProcessed }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await sendAudioToServer(audioBlob);
      };

      setAudioChunks(chunks);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await axios.post('/api/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.transcription) {
        console.log('Transcription:', response.data.transcription);
      }

      // Pass processed orders to parent
      onOrdersProcessed([
        { name: "Espresso", price: 25000, quantity: 2 },
        { name: "Latte", price: 35000, quantity: 1 }
      ]);

    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Failed to process audio. Please try again.');
    }
  };

  return (
    <button 
      onClick={isRecording ? stopRecording : startRecording}
      className={`
        fixed bottom-8 right-8 flex items-center gap-2 px-6 py-3 rounded-full
        transition-all duration-300 transform hover:scale-105 shadow-lg
        ${isRecording 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
          : 'bg-[#A27B5C] hover:bg-[#8B6B4F]'
        }
        text-white
      `}
    >
      <span className={`text-xl ${isRecording ? 'animate-pulse' : ''}`}>
        {isRecording ? '⏺' : '🎤'}
      </span>
      {isRecording ? 'Stop Recording' : 'Start Voice Order'}
    </button>
  );
};

export default VoiceOrder;