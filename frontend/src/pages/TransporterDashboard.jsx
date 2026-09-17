import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, Clock, Navigation, MapPin, ChevronRight, TrendingUp, Route, DollarSign, Gauge } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  ready_for_pickup: 'bg-orange-100 text-orange-700',
  'picked_up': 'bg-indigo-100 text-indigo-700',
  'in_transit': 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

export default function TransporterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ activeTrips: 0, pendingRequests: 0, totalEarnings: 0, distanceCovered: 0 });
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/transporter/stats').catch(() => ({ activeTrips: 0, pendingRequests: 0, totalEarnings: 0, distanceCovered: 0 })),
      api.get('/transport/available').catch(() => []),
    ]).then(([s, d]) => {
      setStats(s);
      const available = d.filter(b => b.status !== 'pending');
      setDeliveries(available.slice(0, 4));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Good Evening, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-600 mt-1">Welcome back to your Transporter Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Trips', value: stats.activeTrips, icon: Truck, color: 'bg-blue-100 text-blue-700' },
          { label: 'Pending Requests', value: stats.pendingRequests, icon: Package, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'bg-green-100 text-green-700' },
          { label: 'Distance Covered', value: `${stats.distanceCovered} km`, icon: Route, color: 'bg-purple-100 text-purple-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${s.color}`}><s.icon className="h-6 w-6" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Deliveries</h2>
          <button onClick={() => navigate('/transporter/trips')} className="text-agro-600 text-sm font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="divide-y">
          {deliveries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No upcoming deliveries</div>
          ) : deliveries.map(d => (
            <div key={d.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition cursor-pointer" onClick={() => navigate(`/track/${d.tracking_id}`)}>
              <div className="h-12 w-12 bg-agro-50 rounded-xl flex items-center justify-center"><Truck className="h-6 w-6 text-agro-700" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{d.crop_name}</p>
                <p className="text-sm text-gray-500">{d.pickup_location} → {d.dropoff_location}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[d.status] || 'bg-gray-100 text-gray-700'}`}>{d.status?.replace('_', ' ')}</span>
                <p className="text-sm font-bold text-agro-700 mt-1">₹{d.fare}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
