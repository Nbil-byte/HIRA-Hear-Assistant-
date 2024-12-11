// src/Pages/HomePage.jsx
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import MenuCard from '../components/MenuCard'
import OrderConfirmation from '../components/OrderConfirmation'

const HomePage = () => {
  const [menus, setMenus] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [audioStream, setAudioStream] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [processedOrders, setProcessedOrders] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    const { data } = await axios.get('/api/menu')
    setMenus(data)
  }

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
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    try {
      if (!audioBlob) {
        throw new Error('No audio data available');
      }

      console.log('Audio blob size:', audioBlob.size);

      const formData = new FormData();
      formData.append('audio', audioBlob, 'order.webm');

      const response = await axios.post('/api/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        }
      });

      console.log('Upload successful:', response.data);
      
      // Process response
      if (response.data.path) {
        setProcessedOrders([]); // Clear any previous orders
        setShowConfirmation(true);
      }

    } catch (error) {
      console.error('Upload error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Failed to upload audio. Please try again.');
    }
  };

  const handleConfirmOrder = async ({ items, note }) => {
    try {
      await axios.post('/api/orders', { 
        items,
        note
      });
      setShowConfirmation(false);
      setProcessedOrders([]);
      // Optional: Show success message
      alert('Order completed successfully!');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Error completing order');
    }
  };

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'coffee', name: '☕ Coffee' },
    { id: 'non-coffee', name: '🥤 Non-Coffee' },
    { id: 'food', name: '🍰 Foods' },
  ]

  const filteredMenus = menus.filter(menu => {
    const matchesCategory = activeCategory === 'all' || menu.category === activeCategory
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Hero Section */}
      <div className="bg-[#2C3639] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Coffee Hub Menu</h1>
              <p className="text-gray-300">Discover our handcrafted selections</p>
            </div>
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-full
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
          </div>

          {/* Search & Filters */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 
                          border border-white/20 text-white placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-[#A27B5C]"
              />
              <span className="absolute left-3 top-2.5">🔍</span>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all
                    ${activeCategory === category.id
                      ? 'bg-[#A27B5C] text-white'
                      : 'bg-white/10 hover:bg-white/20'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredMenus.map(menu => (
            <MenuCard key={menu.id} item={menu} />
          ))}
        </div>
      </div>

      <OrderConfirmation
        orders={processedOrders}
        menus={menus}  // Pass available menus
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmOrder}
      />
    </div>
  )
}

export default HomePage