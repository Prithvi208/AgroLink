import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Star, XCircle, BarChart3, Gauge, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Performance() {
  const [stats, setStats] = useState({ completedTrips: 0, onTimeDeliveryRate: 0, customerRating: 0, cancelledTrips: 0, totalBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transporter/performance').then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Overview</h1>
      <p className="text-gray-600 mb-8">Your delivery performance metrics</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Completed Trips', value: stats.completedTrips, icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
          { label: 'On-time Delivery', value: `${stats.onTimeDeliveryRate}%`, icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
          { label: 'Customer Rating', value: `${stats.customerRating}`, icon: Star, color: 'bg-earth-100 text-earth-700' },
          { label: 'Cancelled Trips', value: stats.cancelledTrips, icon: XCircle, color: 'bg-red-100 text-red-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">{s.label}</p><p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p></div>
              <div className={`p-3 rounded-xl ${s.color}`}><s.icon className="h-6 w-6" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-agro-600" /> Delivery Summary</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"><span className="text-gray-600">Total Bookings</span><span className="font-bold">{stats.totalBookings}</span></div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"><span className="text-gray-600">Completed</span><span className="font-bold text-green-600">{stats.completedTrips}</span></div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"><span className="text-gray-600">On-time Rate</span><span className="font-bold text-blue-600">{stats.onTimeDeliveryRate}%</span></div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"><span className="text-gray-600">Cancelled</span><span className="font-bold text-red-600">{stats.cancelledTrips}</span></div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"><span className="text-gray-600">Rating</span><span className="font-bold text-earth-600">{'⭐'.repeat(Math.round(stats.customerRating))}</span></div>
        </div>
      </div>
    </div>
  );
}
