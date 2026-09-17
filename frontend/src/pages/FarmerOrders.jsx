import { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../utils/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700'
};

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/farmer-orders').then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    await api.put(`/orders/${orderId}/status`, { status });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Received</h1>
      <p className="text-gray-600 mb-8">Manage incoming orders for your crops</p>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16"><Package className="h-16 w-16 mx-auto mb-4 text-gray-300" /><h3 className="text-xl font-bold text-gray-900 mb-2">No orders received</h3><p className="text-gray-500">Orders will appear here when buyers purchase your crops</p></div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{order.crop_name}</h3>
                  <p className="text-sm text-gray-500">Buyer: {order.buyer_name} {order.buyer_phone ? `· ${order.buyer_phone}` : ''}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>{order.status}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div><p className="text-gray-500">Quantity</p><p className="font-medium">{order.quantity}</p></div>
                <div><p className="text-gray-500">Total</p><p className="font-bold text-agro-700">${order.total_price}</p></div>
                <div><p className="text-gray-500">Payment</p><p className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.payment_status}</p></div>
                <div><p className="text-gray-500">Date</p><p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p></div>
              </div>
              {order.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button onClick={() => updateStatus(order.id, 'confirmed')} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"><CheckCircle className="h-4 w-4" /> Accept</button>
                  <button onClick={() => updateStatus(order.id, 'cancelled')} className="flex items-center gap-1 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition"><XCircle className="h-4 w-4" /> Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
