// src/Pages/OrdersPage.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data } = await axios.get('/api/orders')
    setOrders(data)
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'today') {
      return new Date(order.date).toDateString() === new Date().toDateString()
    }
    return true
  })

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order History</h1>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Orders</option>
          <option value="today">Today</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-semibold">Order #{order.id}</p>
                <p className="text-gray-600">
                  {new Date(order.date).toLocaleString()}
                </p>
              </div>
              <p className="text-xl font-bold">${order.total}</p>
            </div>
            <div className="mt-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between py-2">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrdersPage;