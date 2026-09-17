import { useState, useEffect, useSearchParams } from 'react';
import { Truck, MapPin, CheckCircle, Clock, Navigation, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700', accepted: 'bg-blue-100 text-blue-700', ready_for_pickup: 'bg-orange-100 text-orange-700', picked_up: 'bg-purple-100 text-purple-700',
  in_transit: 'bg-indigo-100 text-indigo-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700'
};

export default function Transport() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('available');
  
  // For creating transport from order
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [order, setOrder] = useState(null);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [vehicleType, setVehicleType] = useState('truck');
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
      setShowCreateBooking(true);
      // Remove the orderId from URL after reading to avoid re-triggering on refresh
      setSearchParams({});
    }
  }, [searchParams]);

  useEffect(() => {
    if (orderId && !order) {
      api.get(`/orders/${orderId}`).then(setOrder).catch(() => {});
    }
  }, [orderId]);

  useEffect(() => {
    loadBookings();
  }, [tab]);

  const loadBookings = () => {
    setLoading(true);
    const endpoint = user.role === 'transporter'
      ? (tab === 'available' ? '/transport/available' : '/transport/my')
      : '/transport/my';
    api.get(endpoint).then(setBookings).catch(() => setBookings([])).finally(() => setLoading(false));
  };

  const acceptBooking = async (id) => {
    await api.put(`/transport/${id}/accept`);
    loadBookings();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/transport/${id}/status`, { status });
    loadBookings();
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!order) return;
    setCreatingBooking(true);
    setBookingMessage('');
    try {
      const booking = await api.post('/transport', { 
        order_id: order.id, 
        pickup_location: pickup || order.crop?.location || '', 
        dropoff_location: dropoff || order.delivery_address || '', 
        vehicle_type: vehicleType 
      });
      setBookingMessage('Transport booked successfully!');
      setShowCreateBooking(false);
      setOrderId('');
      setOrder(null);
      loadBookings();
    } catch (err) {
      setBookingMessage(err.message);
    } finally {
      setCreatingBooking(false);
    }
  };

return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Transport Hub</h1>
      <p className="text-gray-600 mb-8">{user.role === 'transporter' ? 'Find and manage delivery jobs' : 'Manage your transport bookings'}</p>

      {/* Create Transport Booking from Order */}
      {showCreateBooking && order && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="h-6 w-6 text-agro-600" /> Arrange Transport
              </h2>
              <p className="text-gray-600 mt-1">Order: {order.crop_name} - {order.quantity} {order.unit}</p>
            </div>
            <button onClick={() => { setShowCreateBooking(false); setOrderId(''); setOrder(null); navigate('/transport'); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {bookingMessage && (
            <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${bookingMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {bookingMessage}
            </div>
          )}

          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
              <input type="text" value={pickup} onChange={e => setPickup(e.target.value)}
                placeholder={order.crop?.location || 'Farmer location'} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drop-off Location</label>
              <input type="text" value={dropoff} onChange={e => setDropoff(e.target.value)}
                placeholder={order.delivery_address || 'Delivery address'} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none">
                <option value="truck">Truck</option>
                <option value="pickup">Pickup</option>
                <option value="van">Van</option>
                <option value="trailer">Trailer</option>
                <option value="tempo">Tempo</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => { setShowCreateBooking(false); setOrderId(''); setOrder(null); navigate('/transport'); }}
                className="flex-1 py-3 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                <ArrowLeft className="h-5 w-5 inline mr-2" /> Cancel
              </button>
              <button type="submit" disabled={creatingBooking}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                <Truck className="h-5 w-5" /> {creatingBooking ? 'Booking...' : 'Book Transport'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transport Hub</h1>
        <p className="text-gray-600 mb-8">{user.role === 'transporter' ? 'Find and manage delivery jobs' : 'Manage your transport bookings'}</p>

        {user.role === 'transporter' && (
          <div className="flex gap-2 mb-6">
            {[{ key: 'available', label: 'Available Jobs' }, { key: 'my', label: 'My Assignments' }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.key ? 'bg-agro-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16"><Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" /><h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3><p className="text-gray-500">{
            user.role === 'transporter' ? 'Check back later for available jobs' : 'Book transport from the marketplace'
          }</p></div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{b.crop_name || 'Order'}</h3>
                    <p className="text-sm text-gray-500">Order Value: ${b.order_value || b.total_price || 'N/A'}</p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>{b.status?.replace('_', ' ')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="h-4 w-4 text-agro-600" /> Pickup: {b.pickup_location}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Navigation className="h-4 w-4 text-blue-600" /> Drop-off: {b.dropoff_location}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="h-4 w-4 text-earth-600" /> Fare: ${b.fare}</div>
                </div>
                {b.tracking_id && <p className="text-sm text-gray-500 mt-2">Tracking: <span className="font-mono font-bold">{b.tracking_id}</span></p>}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {user.role === 'transporter' && b.status === 'pending' && !b.transporter_id && (
                    <button onClick={() => acceptBooking(b.id)} className="flex items-center gap-1 px-4 py-2 bg-agro-600 text-white rounded-xl text-sm font-medium hover:bg-agro-700 transition"><CheckCircle className="h-4 w-4" /> Accept Job</button>
                  )}
{user.role === 'transporter' && b.transporter_id && b.status !== 'delivered' && b.status !== 'cancelled' && (
                      <>
                        {b.status === 'accepted' && <button onClick={() => updateStatus(b.id, 'ready_for_pickup')} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 transition">Mark Ready for Pickup</button>}
                        {b.status === 'ready_for_pickup' && <button onClick={() => updateStatus(b.id, 'picked_up')} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition">Mark Picked Up</button>}
                        {b.status === 'picked_up' && <button onClick={() => updateStatus(b.id, 'in_transit')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">In Transit</button>}
                        {b.status === 'in_transit' && <button onClick={() => updateStatus(b.id, 'delivered')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition">Delivered</button>}
                        <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition">Cancel</button>
                      </>
                    )}
                  {b.tracking_id && (
                    <a href={`/track/${b.tracking_id}`} className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50 transition">Track Shipment</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
