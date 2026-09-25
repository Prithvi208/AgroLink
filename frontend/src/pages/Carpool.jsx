import { useState, useEffect } from 'react';
import { Car, MapPin, Clock, Users, Plus, X, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/netReturn';

export default function Carpool() {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [myRides, setMyRides] = useState({ asDriver: [], asPassenger: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('find');
  const [showForm, setShowForm] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [form, setForm] = useState({ origin: '', destination: '', departure_time: '', available_seats: '', price_per_seat: '', vehicle_info: '' });
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDest, setSearchDest] = useState('');

  const loadRides = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchOrigin) params.set('origin', searchOrigin);
    if (searchDest) params.set('destination', searchDest);
    api.get(`/carpool?${params}`).then(setRides).catch(() => setRides([])).finally(() => setLoading(false));
  };

  const loadMyRides = () => {
    api.get('/carpool/my').then(setMyRides).catch(() => setMyRides({ asDriver: [], asPassenger: [] }));
  };

  useEffect(() => { loadRides(); loadMyRides(); }, []);

  const handleSearch = () => { setLoading(true); loadRides(); };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/carpool', form);
      setShowForm(false);
      setForm({ origin: '', destination: '', departure_time: '', available_seats: '', price_per_seat: '', vehicle_info: '' });
      loadMyRides();
    } catch (err) { alert(err.message); }
  };

  const handleBook = async (rideId) => {
    try {
      await api.post(`/carpool/${rideId}/book`, { seats: 1 });
      loadRides();
      loadMyRides();
      alert('Ride booked successfully!');
    } catch (err) { alert(err.message); }
  };

  const handleCancel = async (rideId) => {
    try {
      await api.delete(`/carpool/${rideId}`);
      loadMyRides();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Car className="h-8 w-8 text-agro-600" /> Carpool</h1>
          <p className="text-gray-600 mt-1">Share rides and reduce transport costs</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-agro-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-agro-700 transition flex items-center gap-2">
          <Plus className="h-5 w-5" /> Offer Ride
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ key: 'find', label: 'Find Rides' }, { key: 'my', label: 'My Rides' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.key ? 'bg-agro-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Offer a Ride</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" placeholder="Origin" value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value }))} required className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              <input type="text" placeholder="Destination" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} required className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              <input type="datetime-local" value={form.departure_time} onChange={e => setForm(p => ({ ...p, departure_time: e.target.value }))} required className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Seats" value={form.available_seats} onChange={e => setForm(p => ({ ...p, available_seats: e.target.value }))} required className="px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
                <input type="number" step="0.01" placeholder="Price/seat" value={form.price_per_seat} onChange={e => setForm(p => ({ ...p, price_per_seat: e.target.value }))} required className="px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              </div>
              <input type="text" placeholder="Vehicle info (optional)" value={form.vehicle_info} onChange={e => setForm(p => ({ ...p, vehicle_info: e.target.value }))} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              <button type="submit" className="w-full bg-agro-600 text-white py-3 rounded-xl font-semibold hover:bg-agro-700 transition">Create Ride</button>
            </form>
          </div>
        </div>
      )}

      {tab === 'find' && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
            <div className="flex gap-3">
              <input type="text" value={searchOrigin} onChange={e => setSearchOrigin(e.target.value)} placeholder="From..." className="flex-1 px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              <input type="text" value={searchDest} onChange={e => setSearchDest(e.target.value)} placeholder="To..." className="flex-1 px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              <button onClick={handleSearch} className="bg-agro-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-agro-700 transition">Search</button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>
          ) : rides.length === 0 ? (
            <div className="text-center py-16"><Car className="h-16 w-16 mx-auto mb-4 text-gray-300" /><h3 className="text-xl font-bold text-gray-900 mb-2">No rides found</h3><p className="text-gray-500">Try different routes or offer your own ride</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rides.map(ride => (
                <div key={ride.id} className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-10 w-10 bg-agro-100 rounded-full flex items-center justify-center font-bold text-agro-700">{ride.driver_name?.charAt(0)}</div>
                    <div><p className="font-medium text-gray-900">{ride.driver_name}</p><p className="text-xs text-gray-500">{ride.vehicle_info || 'Vehicle'}</p></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-green-600" /> {ride.origin}</div>
                    <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-red-600" /> {ride.destination}</div>
                    <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-blue-600" /> {new Date(ride.departure_time).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm text-gray-600"><Users className="h-4 w-4" /> {ride.available_seats} seats</div>
                    <div className="flex items-center gap-1 font-bold text-agro-700"><DollarSign className="h-4 w-4" />{formatCurrency(r.price_per_seat)}/seat</div>
                  </div>
                  {ride.driver_id !== user?.id && (
                    <button onClick={() => handleBook(ride.id)} className="w-full mt-3 bg-agro-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-agro-700 transition">Book Seat</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'my' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rides I'm Driving</h3>
            {myRides.asDriver.length === 0 ? <p className="text-gray-500">No rides offered yet</p> : (
              <div className="space-y-3">
                {myRides.asDriver.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl shadow-sm border p-5 flex items-center justify-between">
                    <div><p className="font-bold">{r.origin} → {r.destination}</p><p className="text-sm text-gray-500">{new Date(r.departure_time).toLocaleString()} · {r.available_seats} seats left · {formatCurrency(r.price_per_seat)}/seat</p></div>
                    <div className="flex gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                      {r.status === 'active' && <button onClick={() => handleCancel(r.id)} className="text-red-600 text-sm hover:underline">Cancel</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rides I've Booked</h3>
            {myRides.asPassenger.length === 0 ? <p className="text-gray-500">No rides booked yet</p> : (
              <div className="space-y-3">
                {myRides.asPassenger.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl shadow-sm border p-5">
                    <p className="font-bold">{r.origin} → {r.destination}</p>
                    <p className="text-sm text-gray-500">Driver: {r.driver_name} · {r.seats_booked} seat(s) · {new Date(r.departure_time).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
