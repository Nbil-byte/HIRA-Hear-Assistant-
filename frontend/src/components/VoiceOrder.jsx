// frontend/src/components/VoiceOrder.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const VoiceOrder = ({ onOrdersProcessed }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processVoiceOrder(audioBlob);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Unable to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processVoiceOrder = async (audioBlob) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob);

      console.log('Sending audio for processing...');
      
      const response = await axios.post('/api/voice-order', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Server response:', response.data);
      
      if (response.data.matchedItems?.length > 0) {
        console.log('Matched items:', response.data.matchedItems);
        onOrdersProcessed(response.data.matchedItems);
      } else {
        console.log('No items matched in transcription:', response.data.transcription);
        alert(`No menu items were recognized in: "${response.data.transcription}"`);
      }
    } catch (error) {
      console.error('Error processing voice order:', error);
      alert('Failed to process voice order: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      className={`
        fixed bottom-8 right-8 
        flex items-center gap-2 px-6 py-3 rounded-full
        transition-all duration-300 transform 
        ${isProcessing ? 'bg-gray-500 cursor-not-allowed' :
          isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/50' : 
                       'bg-[#A27B5C] hover:bg-[#8B6B4F] hover:scale-105'
        }
        shadow-lg text-white
      `}
    >
      <span className={`text-xl ${isRecording ? 'animate-pulse' : ''}`}>
        {isProcessing ? '⏳' : isRecording ? '⏺' : '🎤'}
      </span>
      <span>
        {isProcessing ? 'Processing...' : 
         isRecording ? `Recording (${recordingTime}s)` : 'Start Voice Order'}
      </span>
    </button>
  );
};

export default VoiceOrder;