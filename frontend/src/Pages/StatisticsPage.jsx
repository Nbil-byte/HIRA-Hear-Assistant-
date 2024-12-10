// src/Pages/StatisticsPage.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatIDR } from '../utils/formatCurrency'

const StatisticsPage = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    popularItems: [],
    weeklySales: []
  })
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/orders')
      ]);
      
      setStats(statsRes.data);
      setOrders(ordersRes.data.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'today') {
      return new Date(order.date).toDateString() === new Date().toDateString()
    }
    return true
  })

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-500 mb-1">Today's Sales</h3>
            <p className="text-3xl font-bold text-[#2C3639]">{formatIDR(stats.todaySales)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-500 mb-1">Total Sales</h3>
            <p className="text-3xl font-bold text-[#2C3639]">{formatIDR(stats.totalSales)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-500 mb-1">Total Orders</h3>
            <p className="text-3xl font-bold text-[#2C3639]">{orders.length}</p>
          </div>
        </div>

        {/* Popular Items & Weekly Sales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#2C3639]">Popular Items</h3>
            <div className="divide-y">
              {stats.popularItems.map((item, index) => (
                <div key={index} className="flex justify-between py-3">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-sm text-gray-500">{formatIDR(item.price)}</span>
                  </div>
                  <span className="text-[#A27B5C] font-medium">{item.count} orders</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#2C3639]">Weekly Sales</h3>
            {/* Add chart visualization here */}
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-[#2C3639]">Order History</h3>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-[#A27B5C]"
              >
                <option value="all">All Orders</option>
                <option value="today">Today</option>
              </select>
            </div>
          </div>
          
          <div className="divide-y">
            {filteredOrders.map(order => (
              <div key={order.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-[#2C3639]">Order #{order.id}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleString()}
                      </span>
                    </div>
                    {order.note && (
                      <p className="text-sm text-gray-600 mt-1">{order.note}</p>
                    )}
                  </div>
                  <span className="text-xl font-bold text-[#A27B5C]">
                    {formatIDR(order.total)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-gray-900">{formatIDR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatisticsPage