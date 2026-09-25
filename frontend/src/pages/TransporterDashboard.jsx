import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Package, Clock, Navigation, MapPin, ChevronRight, TrendingUp, Route, DollarSign, Gauge, ArrowRight, AlertCircle, Send, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  const [availableRequests, setAvailableRequests] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    
    Promise.all([
      api.get('/transporter/stats').catch(() => ({ activeTrips: 0, pendingRequests: 0, totalEarnings: 0, distanceCovered: 0 })),
      api.get('/transport/available').catch(() => []),
      api.get('/transport/my').catch(() => []),
    ]).then(([s, available, myBookings]) => {
      if (cancelled) return;
      
      setStats(s);
      
      // Available requests for quick actions
      const availableRequestsFiltered = available.filter(b => b.status === 'pending' && b.transporter_id === null);
      setAvailableRequests(availableRequestsFiltered.slice(0, 3));
      
      // Active delivery - the one currently in transit
      const myActive = myBookings.find(b => ['accepted', 'ready_for_pickup', 'picked_up', 'in_transit'].includes(b.status));
      setActiveDelivery(myActive || null);
      
      // Upcoming deliveries - accepted but not yet picked up, or upcoming
      const upcoming = myBookings.filter(b => ['accepted', 'ready_for_pickup'].includes(b.status));
      setUpcomingDeliveries(upcoming.slice(0, 4));
      
      setLoading(false);
    }).catch(err => {
      if (!cancelled) {
        console.error('[TransporterDashboard] Failed to load data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    });
    
    return () => { cancelled = true; };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    { label: 'Find Requests', to: '/transporter/requests', icon: Package, color: 'bg-blue-100 text-blue-700' },
    { label: 'Active Delivery', to: '/transporter/active', icon: Navigation, color: 'bg-orange-100 text-orange-700' },
    { label: 'My Vehicles', to: '/transporter/vehicles', icon: Truck, color: 'bg-purple-100 text-purple-700' },
  ];

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Failed to Load Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="h-5 w-5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Active Trips', value: stats.activeTrips, icon: Truck, color: 'bg-blue-100 text-blue-700' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: Package, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'bg-green-100 text-green-700' },
    { label: 'Distance Covered', value: `${stats.distanceCovered} km`, icon: Route, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-600 mt-1">Welcome back to your Transporter Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.to}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${action.color} hover:border-agro-400 hover:bg-agro-50`}>
                <action.icon className="h-8 w-8" />
                <span className="text-sm font-semibold text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Pending Transport Requests</h2>
          </div>
          {availableRequests.length > 0 ? (
            <div className="space-y-3">
              {availableRequests.map(req => (
                <Link key={req.id} to={`/transporter/requests`} className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{req.crop_name}</p>
                    <p className="text-sm text-gray-500">{req.pickup_location} → {req.dropoff_location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Pending</span>
                    <p className="text-sm font-bold text-blue-600 mt-1">₹{req.fare}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-gray-900 mb-1">No pending transport requests</p>
              <p className="text-sm">Check back later for new requests</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Active Delivery</h2>
              {activeDelivery && (
                <Link to={`/track/${activeDelivery.tracking_id}`} className="text-agro-600 text-sm font-medium flex items-center gap-1 hover:underline">
                  Track <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="divide-y">
              {activeDelivery ? (
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-agro-50 rounded-xl flex items-center justify-center">
                      <Truck className="h-6 w-6 text-agro-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{activeDelivery.crop_name}</p>
                      <p className="text-sm text-gray-500">{activeDelivery.pickup_location} → {activeDelivery.dropoff_location}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[activeDelivery.status] || 'bg-gray-100 text-gray-700'}`}>{activeDelivery.status?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600"><MapPin className="h-4 w-4 text-agro-600" /> Pickup: {activeDelivery.pickup_location}</div>
                    <div className="flex items-center gap-2 text-gray-600"><MapPin className="h-4 w-4 text-red-600" /> Drop: {activeDelivery.dropoff_location}</div>
                    <div className="flex items-center gap-2 text-gray-600"><Package className="h-4 w-4 text-blue-600" /> {activeDelivery.quantity} {activeDelivery.unit}</div>
                    <div className="flex items-center gap-2 text-gray-600"><DollarSign className="h-4 w-4 text-green-600" /> Fare: ₹{activeDelivery.fare}</div>
                  </div>
                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <Link to={`/track/${activeDelivery.tracking_id}`} className="flex-1 bg-agro-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-agro-700 transition flex items-center justify-center gap-2">
                      <Navigation className="h-4 w-4" /> Track Live
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-900 mb-1">No active delivery</p>
                  <p className="text-sm mb-4">Accept a transport request to start a trip</p>
                  <Link to="/transporter/requests" className="inline-flex items-center gap-2 bg-agro-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-agro-700 transition">
                    <Package className="h-4 w-4" /> Find Requests
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Deliveries</h2>
              <Link to="/transporter/trips" className="text-agro-600 text-sm font-medium flex items-center gap-1 hover:underline">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y">
              {upcomingDeliveries.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-900 mb-1">No upcoming deliveries</p>
                  <p className="text-sm">Accepted transport requests will appear here</p>
                </div>
              ) : upcomingDeliveries.map(d => (
                <Link key={d.id} to={`/track/${d.tracking_id}`} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition cursor-pointer">
                  <div className="h-12 w-12 bg-agro-50 rounded-xl flex items-center justify-center"><Truck className="h-6 w-6 text-agro-700" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{d.crop_name}</p>
                    <p className="text-sm text-gray-500">{d.pickup_location} → {d.dropoff_location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[d.status] || 'bg-gray-100 text-gray-700'}`}>{d.status?.replace('_', ' ')}</span>
                    <p className="text-sm font-bold text-agro-700 mt-1">₹{d.fare}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}