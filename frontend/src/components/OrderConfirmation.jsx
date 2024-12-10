// frontend/src/components/OrderConfirmation.jsx
import { useState, useEffect } from 'react';
import { formatIDR } from '../utils/formatCurrency';

const OrderConfirmation = ({ orders, isOpen, onClose, onConfirm, menus = [] }) => {
  // Keep original orders and modified orders separate
  const [originalOrders] = useState(orders);
  const [modifiedOrders, setModifiedOrders] = useState(orders);
  const [note, setNote] = useState('');
  const [showMenuAdd, setShowMenuAdd] = useState(false);

  // Sync when new orders come in
  useEffect(() => {
    setModifiedOrders(orders);
  }, [orders]);

  if (!isOpen) return null;

  const total = modifiedOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const newOrders = [...modifiedOrders];
    newOrders[index] = {
      ...newOrders[index],
      quantity: newQuantity,
      wasModified: true
    };
    setModifiedOrders(newOrders);
  };

  const removeItem = (index) => {
    const newOrders = modifiedOrders.filter((_, i) => i !== index);
    setModifiedOrders(newOrders);
  };

  const addMenuItem = (menu) => {
    const existingItem = modifiedOrders.find(item => item.id === menu.id);
    if (existingItem) {
      const index = modifiedOrders.indexOf(existingItem);
      updateQuantity(index, existingItem.quantity + 1);
    } else {
      setModifiedOrders([
        ...modifiedOrders,
        { 
          ...menu, 
          quantity: 1,
          isAdditional: true // Mark as manually added
        }
      ]);
    }
    setShowMenuAdd(false);
  };

  const handleConfirm = () => {
    onConfirm({
      items: modifiedOrders,
      originalItems: originalOrders,
      note,
      modifications: {
        added: modifiedOrders.filter(item => item.isAdditional),
        modified: modifiedOrders.filter(item => item.wasModified)
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#2C3639]">Order Summary</h2>
              <p className="text-sm text-gray-500">AI Processed Order with Modifications</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              ❌
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {modifiedOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No items in order</p>
          ) : (
            <div className="space-y-4">
              {modifiedOrders.map((item, index) => (
                <div key={index} 
                     className={`flex items-center justify-between p-4 rounded-lg mb-2
                               ${item.isAdditional ? 'bg-green-50' : 
                                 item.wasModified ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      {item.name}
                      {item.isAdditional && 
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Added</span>
                      }
                      {item.wasModified && 
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Modified</span>
                      }
                    </h3>
                    <p className="text-[#A27B5C]">{formatIDR(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add More Items */}
          <button
            onClick={() => setShowMenuAdd(true)}
            className="mt-4 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg
                     text-gray-500 hover:border-[#A27B5C] hover:text-[#A27B5C]"
          >
            + Add More Items
          </button>

          {showMenuAdd && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Add to Order</h3>
              <div className="grid grid-cols-2 gap-2">
                {menus.map(menu => (
                  <button
                    key={menu.id}
                    onClick={() => addMenuItem(menu)}
                    className="p-2 text-left hover:bg-[#A27B5C] hover:text-white rounded-lg transition-colors"
                  >
                    <div className="font-medium">{menu.name}</div>
                    <div className="text-sm">{formatIDR(menu.price)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Note */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Notes
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add special instructions..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#A27B5C]"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-[#2C3639]">
              {formatIDR(total)}
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={modifiedOrders.length === 0}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-white
                ${modifiedOrders.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-[#A27B5C] hover:bg-[#8B6B4F]'}`}
            >
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;