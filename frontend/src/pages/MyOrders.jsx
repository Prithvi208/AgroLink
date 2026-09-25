import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Truck } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/netReturn';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700'
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
      <p className="text-gray-600 mb-8">Track your crop purchases</p>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16"><Package className="h-16 w-16 mx-auto mb-4 text-gray-300" /><h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3><Link to="/marketplace" className="text-agro-600 hover:underline">Browse Marketplace</Link></div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{order.crop_name}</h3>
                  <p className="text-sm text-gray-500">From: {order.farmer_name}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>{order.status}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div><p className="text-gray-500">Quantity</p><p className="font-medium">{order.quantity}</p></div>
                <div><p className="text-gray-500">Total</p><p className="font-bold text-agro-700">{formatCurrency(order.total_price)}</p></div>
                <div><p className="text-gray-500">Payment</p><p className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.payment_status}</p></div>
                <div><p className="text-gray-500">Date</p><p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p></div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Link to={`/marketplace/${order.crop_id}`} className="flex items-center gap-1 px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50 transition"><Eye className="h-4 w-4" /> View Crop</Link>
                <Link to={`/payments`} className="flex items-center gap-1 px-4 py-2 bg-agro-600 text-white rounded-xl text-sm font-medium hover:bg-agro-700 transition">Pay Now</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
