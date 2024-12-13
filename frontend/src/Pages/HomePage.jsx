// src/Pages/HomePage.jsx
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import MenuCard from '../components/MenuCard'
import OrderConfirmation from '../components/OrderConfirmation'
import VoiceOrder from '../components/VoiceOrder'

const HomePage = () => {
  const [menus, setMenus] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState([]);

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    const { data } = await axios.get('/api/menu')
    setMenus(data)
  }

  const sendAudioToServer = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await axios.post('http://localhost:8080/api/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('Audio upload success:', response.data);
      return response.data;

    } catch (error) {
      console.error('Audio processing error:', error.response?.data || error.message);
      throw error;
    }
  };

  const handleConfirmOrder = async ({ items, note }) => {
    try {
      await axios.post('/api/orders', { 
        items,
        note
      });
      setShowOrderModal(false);
      // Optional: Show success message
      alert('Order completed successfully!');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Error completing order');
    }
  };

  const handleVoiceOrderProcessed = (items) => {
    console.log('Voice order items received:', items);
    setCurrentOrder(items);
    setShowOrderModal(true);
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
              <h1 className="text-4xl font-bold mb-2">Hira Cafe Menu</h1>
              <p className="text-gray-300">Discover our handcrafted selections</p>
            </div>
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

      <VoiceOrder onOrdersProcessed={handleVoiceOrderProcessed} />

      <OrderConfirmation
        orders={currentOrder}
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onConfirm={handleConfirmOrder}
      />
    </div>
  )
}

export default HomePage