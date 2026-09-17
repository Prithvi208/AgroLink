import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, MapPin, Clock, Package, Truck, Navigation as NavIcon, Phone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const statusFlow = ['accepted', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered'];
const statusLabels = { accepted: 'Accepted', ready_for_pickup: 'Ready for Pickup', picked_up: 'Pickup', 'in_transit': 'In Transit', delivered: 'Delivered' };
const statusColors = { accepted: 'bg-blue-100 text-blue-700', ready_for_pickup: 'bg-orange-100 text-orange-700', picked_up: 'bg-indigo-100 text-indigo-700', 'in_transit': 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700' };

export default function ActiveDelivery() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transport/my').then(d => {
      const active = d.filter(b => !['delivered', 'cancelled'].includes(b.status));
      setBookings(active);
      setLoading(false);
    }).catch(() => { setBookings([]); setLoading(false); });
  }, []);

  const updateStatus = async (id, newStatus) => {
    await api.put(`/transport/${id}/status`, { status: newStatus });
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>;

  const activeBooking = bookings.find(b => b.status === 'in_transit') || bookings[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Delivery</h1>
      <p className="text-gray-600 mb-8">Manage your ongoing deliveries</p>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border"><Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">No active deliveries</p></div>
      ) : (
        <div className="space-y-6">
          {bookings.map(b => {
            const currentStep = statusFlow.indexOf(b.status);
            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900">{b.crop_name}</h3>
                    <p className="text-sm text-gray-500">{b.pickup_location} → {b.dropoff_location}</p>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full capitalize ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>{b.status?.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center justify-between mb-6 px-2">
                  {statusFlow.map((step, i) => (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-agro-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {i <= currentStep ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{statusLabels[step]}</p>
                      {i < statusFlow.length - 1 && <div className={`h-1 w-full mt-2 rounded ${i < currentStep ? 'bg-agro-500' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-agro-600" /> Pickup: {b.pickup_location}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-red-600" /> Drop: {b.dropoff_location}</div>
                  <div className="flex items-center gap-2"><Package className="h-4 w-4 text-blue-600" /> {b.quantity} {b.unit}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-earth-600" /> Fare: ₹{b.fare}</div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  {b.status === 'accepted' && <button onClick={() => updateStatus(b.id, 'picked_up')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">Mark Picked Up</button>}
                  {b.status === 'picked_up' && <button onClick={() => updateStatus(b.id, 'in_transit')} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition">Mark In Transit</button>}
                  {b.status === 'in_transit' && <button onClick={() => updateStatus(b.id, 'delivered')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition">Mark Delivered</button>}
                  <button onClick={() => navigate(`/track/${b.tracking_id}`)} className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50 transition">View Trip Details</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
