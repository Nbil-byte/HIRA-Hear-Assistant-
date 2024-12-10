import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatIDR } from '../utils/formatCurrency';

const SettingsPage = () => {
  const [menus, setMenus] = useState([]);
  const [editingMenu, setEditingMenu] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [newMenu, setNewMenu] = useState({
    name: '',
    price: '',
    description: '',
    category: 'coffee',
    image: null
  });

  const categories = [
    { id: 'coffee', name: '☕ Coffee' },
    { id: 'non-coffee', name: '🥤 Non-Coffee' },
    { id: 'food', name: '🍰 Foods' },
  ];

  const fetchMenus = async () => {
    const response = await axios.get('/api/menu');
    setMenus(response.data);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleAddMenu = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Validate required fields
      if (!newMenu.name || !newMenu.price) {
        throw new Error('Name and price are required');
      }

      // Append all fields to FormData
      Object.keys(newMenu).forEach(key => {
        if (key === 'image' && newMenu[key]) {
          formData.append('image', newMenu[key]);
        } else if (key !== 'image') {
          formData.append(key, newMenu[key]);
        }
      });

      await axios.post('/api/menu', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form
      setNewMenu({
        name: '',
        price: '',
        description: '',
        category: 'coffee',
        image: null
      });

      // Refresh menu list
      fetchMenus();

      // Show success message (optional)
      alert('Menu added successfully');

    } catch (error) {
      setError(error.message || 'Failed to add menu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMenu = async (id) => {
    await axios.put(`/api/menu/${id}`, editingMenu);
    fetchMenus();
    setEditingMenu(null);
  };

  const handleDeleteMenu = async (id) => {
    await axios.delete(`/api/menu/${id}`);
    fetchMenus();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Add Menu Form Section */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#2C3639] mb-6">Add New Menu</h2>
              
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddMenu} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Caramel Macchiato"
                    value={newMenu.name}
                    onChange={(e) => setNewMenu({...newMenu, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A27B5C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (IDR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 35000"
                    value={newMenu.price}
                    onChange={(e) => setNewMenu({...newMenu, price: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A27B5C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newMenu.category}
                    onChange={(e) => setNewMenu({...newMenu, category: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A27B5C] focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Describe your menu item..."
                    value={newMenu.description}
                    onChange={(e) => setNewMenu({...newMenu, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A27B5C] focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewMenu({...newMenu, image: e.target.files[0]})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A27B5C] focus:border-transparent"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all
                    ${isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#A27B5C] hover:bg-[#8B6B4F] text-white shadow-lg hover:shadow-xl'
                    }`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Menu Item'}
                </button>
              </form>
            </div>
          </div>

          {/* Menu List Section */}
          <div className="lg:flex-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#2C3639] mb-6">Current Menu Items</h2>
              
              <div className="grid gap-4">
                {menus.map(menu => (
                  <div key={menu.id} 
                       className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {editingMenu?.id === menu.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editingMenu.name}
                          onChange={(e) => setEditingMenu({...editingMenu, name: e.target.value})}
                          className="w-full p-2 border rounded"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editingMenu.price}
                            onChange={(e) => setEditingMenu({...editingMenu, price: e.target.value})}
                            className="flex-1 p-2 border rounded"
                          />
                          <select
                            value={editingMenu.category}
                            onChange={(e) => setEditingMenu({...editingMenu, category: e.target.value})}
                            className="flex-1 p-2 border rounded"
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateMenu(menu.id)}
                            className="px-4 py-2 bg-[#A27B5C] text-white rounded hover:bg-[#8B6B4F]"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingMenu(null)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{menu.name}</h3>
                            <span className="px-2 py-1 bg-[#A27B5C]/10 text-[#A27B5C] text-xs rounded-full">
                              {categories.find(c => c.id === menu.category)?.name || menu.category}
                            </span>
                          </div>
                          <p className="text-gray-600">{formatIDR(menu.price)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingMenu(menu)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteMenu(menu.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
