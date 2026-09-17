import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Search, MapPin, Truck, Package, Clock, CheckCircle, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import TrackMap from '../components/TrackMap';

const CITY_COORDS = {
  'delhi': [28.6139, 77.2090],
  'punjab': [31.1471, 75.3412],
  'ludhiana': [30.9010, 75.8573],
  'amritsar': [31.6340, 74.8723],
  'maharashtra': [19.7515, 75.7139],
  'mumbai': [19.0760, 72.8777],
  'pune': [18.5204, 73.8567],
  'nashik': [20.0059, 73.7896],
  'gujarat': [22.2587, 71.1924],
  'ahmedabad': [23.0225, 72.5714],
  'jaipur': [26.9124, 75.7873],
  'agra': [27.1767, 78.0081],
  'karnataka': [15.3173, 75.7139],
  'tamil': [11.1271, 78.6569],
  'kerala': [10.1632, 76.6413],
  'delhi market complex': [28.6315, 77.2167],
  'mumbai central store': [18.9695, 72.8199],
  'delhi textile hub': [28.6367, 77.2149],
};

function getCoords(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (n.includes(key)) return coords;
  }
  return null;
}

function interpolate(start, end, pct) {
  return [start[0] + (end[0] - start[0]) * pct, start[1] + (end[1] - start[1]) * pct];
}

export default function ShipmentTracker() {
  const { trackingId } = useParams();
  const { user } = useAuth();
  const [searchId, setSearchId] = useState(trackingId || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simMsg, setSimMsg] = useState('');
  const simTimer = useRef(null);

  useEffect(() => {
    if (trackingId) {
      setSearchId(trackingId);
      track(trackingId);
    }
    return () => { if (simTimer.current) clearInterval(simTimer.current); };
  }, [trackingId]);

  const track = async (id) => {
    setLoading(true);
    setError('');
    try {
      const result = await api.get(`/shipments/${id}`);
      setData(result);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const simulateRoute = async () => {
    if (!data?.booking) return;
    setSimulating(true);
    setSimMsg('');

    const start = getCoords(data.booking.pickup_location) || [28.6139, 77.2090];
    const end = getCoords(data.booking.dropoff_location) || [19.0760, 72.8777];

    const statuses = ['picked_up', 'in_transit', 'in_transit', 'delivered'];

    let step = 0;
    setSimMsg('Simulating truck movement...');
    simTimer.current = setInterval(async () => {
      const pct = step / (statuses.length - 1);
      const [lat, lng] = interpolate(start, end, Math.min(pct, 1));

      await api.post(`/shipments/${data.booking.id}/location`, {
        current_location: step === statuses.length - 1 ? data.booking.dropoff_location : `${Math.round(pct * 100)}% along route`,
        latitude: lat,
        longitude: lng,
        status: statuses[step],
      });

      step += 1;
      if (step >= statuses.length) {
        clearInterval(simTimer.current);
        simTimer.current = null;
        setSimulating(false);
        setSimMsg('Route simulation complete!');
        track(searchId);
      }
    }, 2500);
  };

  const statusSteps = ['pending', 'accepted', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered'];
  const currentStep = data ? statusSteps.indexOf(data.booking?.status) : -1;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipment Tracker</h1>
      <p className="text-gray-600 mb-8">Track your deliveries in real-time on the map</p>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)}
              placeholder="Enter Tracking ID (e.g., TRK-XXXXXXXX)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none"
              onKeyDown={e => e.key === 'Enter' && track(searchId)} />
          </div>
          <button onClick={() => track(searchId)} disabled={loading || !searchId}
            className="bg-agro-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-agro-700 transition disabled:opacity-50">
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

      {data && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{data.booking?.crop_name || 'Order'}</h2>
                <p className="text-gray-500">Tracking: <span className="font-mono font-bold text-agro-700">{data.booking?.tracking_id}</span></p>
              </div>
              <span className={`text-sm font-medium px-4 py-2 rounded-xl capitalize ${data.booking?.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {data.booking?.status?.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between mb-8 px-4">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-agro-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {i <= currentStep ? <CheckCircle className="h-5 w-5" /> : <span className="text-sm font-bold">{i + 1}</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 capitalize text-center">{step.replace('_', ' ')}</p>
                  {i < statusSteps.length - 1 && <div className={`h-1 w-full mt-2 rounded ${i < currentStep ? 'bg-agro-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-agro-600" /><span className="text-gray-600">From:</span> {data.booking?.pickup_location}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-red-600" /><span className="text-gray-600">To:</span> {data.booking?.dropoff_location}</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-blue-600" /><span className="text-gray-600">Fare:</span> ${data.booking?.fare}</div>
              <div className="flex items-center gap-2"><Package className="h-4 w-4 text-earth-600" /><span className="text-gray-600">Value:</span> ${data.booking?.total_price}</div>
            </div>
          </div>

          {user?.role === 'transporter' && data.booking?.transporter_id === user.id && data.booking?.status !== 'delivered' && (
            <div className="bg-agro-50 border border-agro-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-agro-800 flex items-center gap-2">
                    <Navigation className="h-5 w-5" /> Demo Location Simulator
                  </h3>
                  <p className="text-sm text-agro-700 mt-1">Demo GPS: simulate the truck moving from pickup to drop-off on the map below.</p>
                </div>
                <button onClick={simulateRoute} disabled={simulating}
                  className="bg-agro-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-agro-700 transition disabled:opacity-50">
                  {simulating ? 'Simulating...' : 'Start Simulation'}
                </button>
              </div>
              {simMsg && <p className="text-sm text-agro-700 mt-2">{simMsg}</p>}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Demo Map (Simulated Route)</h3>
            <TrackMap locations={data.shipments || []} />
            {(data.shipments?.length || 0) > 0 && (
              <p className="text-xs text-gray-500 mt-3">
                Green truck marker = latest position. Line shows the simulated route traveled. This is a demo simulation, not real GPS tracking.
              </p>
            )}
          </div>

          {data.shipments?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4">Location History (Demo)</h3>
              <div className="space-y-4">
                {data.shipments.map((s, i) => (
                  <div key={s.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-agro-500' : 'bg-gray-300'}`} />
                      {i < data.shipments.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mt-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-gray-900">{s.current_location}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="capitalize">{s.status?.replace('_', ' ')}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(s.updated_at).toLocaleString()}</span>
                      </div>
                      {s.latitude && s.longitude && <p className="text-xs text-gray-400 mt-1">Location: ({s.latitude.toFixed?.(4) || s.latitude}, {s.longitude.toFixed?.(4) || s.longitude})</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}