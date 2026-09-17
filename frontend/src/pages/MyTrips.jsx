import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, Navigation, Clock, Package, Truck, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700', accepted: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-indigo-100 text-indigo-700', 'in_transit': 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700'
};

export default function MyTrips() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transport/my').then(d => { setBookings(d); setLoading(false); }).catch(() => { setBookings([]); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
      <p className="text-gray-600 mb-8">{bookings.length} trip{bookings.length !== 1 ? 's' : ''} managed</p>
      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border"><Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">No trips yet</p></div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/track/${b.tracking_id}`)}>
              <div className="h-10 w-10 bg-agro-50 rounded-lg flex items-center justify-center"><Truck className="h-5 w-5 text-agro-700" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{b.crop_name}</p>
                <p className="text-sm text-gray-500">{b.pickup_location} → {b.dropoff_location}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>{b.status?.replace('_', ' ')}</span>
                <p className="text-sm font-bold text-agro-700">₹{b.fare}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
