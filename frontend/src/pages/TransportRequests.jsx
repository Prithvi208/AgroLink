import { useState, useEffect } from 'react';
import { Package, MapPin, Clock, CheckCircle2, XCircle, Navigation, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const statusColors = { pending: 'bg-yellow-100 text-yellow-700', accepted: 'bg-blue-100 text-blue-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

export default function TransportRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transport/available').then(d => { setRequests(d); setLoading(false); }).catch(() => { setRequests([]); setLoading(false); });
  }, []);

  const handleAccept = async (id) => {
    await api.put(`/transport/${id}/accept`);
    setRequests(requests.filter(r => r.id !== id));
  };

  const handleDecline = async (id) => {
    await api.put(`/transport/${id}/decline`);
    setRequests(requests.filter(r => r.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Transport Requests</h1>
      <p className="text-gray-600 mb-8">{requests.length} request{requests.length !== 1 ? 's' : ''} waiting for your acceptance</p>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-300" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-500">No pending transport requests at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{r.crop_name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-agro-700">₹{r.fare}</p>
                  <p className="text-xs text-gray-500">offered fare</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600"><MapPin className="h-4 w-4 text-agro-600" /> {r.pickup_location}</div>
                <div className="flex items-center gap-2 text-gray-600"><Navigation className="h-4 w-4 text-red-600" /> {r.dropoff_location}</div>
                <div className="flex items-center gap-2 text-gray-600"><Package className="h-4 w-4 text-blue-600" /> {r.quantity} {r.unit}</div>
                <div className="flex items-center gap-2 text-gray-600"><Clock className="h-4 w-4 text-earth-600" /> {new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAccept(r.id)} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition"><CheckCircle2 className="h-4 w-4" /> Accept Request</button>
                <button onClick={() => handleDecline(r.id)} className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition"><XCircle className="h-4 w-4" /> Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
