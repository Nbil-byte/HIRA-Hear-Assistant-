// frontend/src/components/OrderConfirmation.jsx
import { useState, useEffect } from 'react';
import { formatIDR } from '../utils/formatCurrency';
import axios from 'axios';

const OrderConfirmation = ({ orders, isOpen, onClose, onConfirm }) => {
  const [modifiedOrders, setModifiedOrders] = useState(orders);
  const [note, setNote] = useState('');
  const [availableMenus, setAvailableMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  useEffect(() => {
    setModifiedOrders(orders);
    fetchAvailableMenus();
  }, [orders]);

  const fetchAvailableMenus = async () => {
    try {
      const response = await axios.get('/api/menu');
      setAvailableMenus(response.data);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    }
  };

  const total = modifiedOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const newOrders = [...modifiedOrders];
    newOrders[index] = { ...newOrders[index], quantity: newQuantity };
    setModifiedOrders(newOrders);
  };

  const removeItem = (index) => {
    setModifiedOrders(orders => orders.filter((_, i) => i !== index));
  };

  const addNewItem = () => {
    if (!selectedMenu) return;
    
    const menuItem = availableMenus.find(m => m.id === parseInt(selectedMenu));
    if (!menuItem) return;

    const existingItemIndex = modifiedOrders.findIndex(item => item.id === menuItem.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      const newOrders = [...modifiedOrders];
      newOrders[existingItemIndex].quantity += newItemQuantity;
      setModifiedOrders(newOrders);
    } else {
      // Add new item
      setModifiedOrders([...modifiedOrders, { ...menuItem, quantity: newItemQuantity }]);
    }

    // Reset form
    setSelectedMenu('');
    setNewItemQuantity(1);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Confirm Your Order</h2>
          
          {/* Add New Item Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Add Item to Order</h3>
            <div className="flex gap-3">
              <select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-[#A27B5C]"
              >
                <option value="">Select menu item...</option>
                {availableMenus.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name} - {formatIDR(menu.price)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                className="w-20 p-2 border rounded"
              />
              <button
                onClick={addNewItem}
                className="px-4 py-2 bg-[#A27B5C] text-white rounded hover:bg-[#8B6B4F]"
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Order Items List */}
          <div className="max-h-[40vh] overflow-y-auto mb-4">
            {modifiedOrders.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-b">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">{formatIDR(item.price)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-24 text-right">{formatIDR(item.price * item.quantity)}</span>
                  <button 
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Notes */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add note to your order..."
            className="w-full mt-4 p-3 border rounded focus:ring-2 focus:ring-[#A27B5C]"
            rows="2"
          />

          {/* Total and Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xl font-bold">
              Total: {formatIDR(total)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm({ items: modifiedOrders, note, total })}
                className="px-6 py-2 bg-[#A27B5C] text-white rounded hover:bg-[#8B6B4F]"
                disabled={modifiedOrders.length === 0}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default OrderConfirmation;