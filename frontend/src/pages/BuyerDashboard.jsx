import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Truck, Wheat, Package, ArrowRight, AlertCircle, ClipboardList, Hand, Search, MapPin, TrendingDown, Send, Truck as TruckIcon, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';

const CategoryIcon = ({ category }) => {
  const icons = {
    grains: Wheat,
    vegetables: Package,
    fruits: Package,
    spices: Package,
    dairy: Package,
    pulses: Package,
    cotton: Package,
    sugarcane: Package,
    default: Wheat
  };
  const Icon = icons[category?.toLowerCase()] || icons.default;
  return <Icon className="h-6 w-6 text-agro-600" />;
};

const CategoryIconLarge = ({ category }) => {
  const icons = {
    grains: Wheat,
    vegetables: Package,
    fruits: Package,
    spices: Package,
    dairy: Package,
    pulses: Package,
    cotton: Package,
    sugarcane: Package,
    default: Wheat
  };
  const Icon = icons[category?.toLowerCase()] || icons.default;
  return <Icon className="h-8 w-8" />;
};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [pendingOffers, setPendingOffers] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    
    Promise.all([
      api.get('/market/dashboard').catch(() => ({ stats: {}, recentCrops: [], categories: [] })),
      api.get('/orders/my').catch(() => []),
      api.get('/offers/buyer').catch(() => []),
      api.get('/transport/my').catch(() => []),
    ]).then(([dashboardData, orders, offers, transports]) => {
      if (cancelled) return;
      
      setData(dashboardData);
      setBuyerOrders(orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)));
      setPendingOffers(offers.filter(o => o.status === 'pending'));
      setActiveDeliveries(transports.filter(t => ['accepted', 'ready_for_pickup', 'picked_up', 'in_transit'].includes(t.status)));
      setLoading(false);
    }).catch(err => {
      if (!cancelled) {
        console.error('[BuyerDashboard] Failed to load data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    });
    
    return () => { cancelled = true; };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 17) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

  const quickActions = [
    { label: t('buyerDashboard.browseMarketplace') || 'Browse Marketplace', to: '/marketplace', icon: ShoppingCart, color: 'bg-agro-100 text-agro-700' },
    { label: t('buyerDashboard.myOrders') || 'My Orders', to: '/my-orders', icon: ClipboardList, color: 'bg-blue-100 text-blue-700' },
    { label: t('buyerDashboard.myOffers') || 'My Offers', to: '/offers', icon: Hand, color: 'bg-purple-100 text-purple-700' },
    { label: t('buyerDashboard.findTransport') || 'Find Transport', to: '/transport', icon: TruckIcon, color: 'bg-earth-100 text-earth-700' },
  ];

  const activeDeliveriesCount = activeDeliveries.length;
  const ordersAwaitingTransport = buyerOrders.filter(o => o.status === 'confirmed' && !o.transport_booked).length;

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div>
    </div>
  );

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

  const stats = [
    { label: t('buyerDashboard.availableCrops'), value: data?.stats?.totalCrops || 0, icon: Search, color: 'bg-agro-100 text-agro-700' },
    { label: t('buyerDashboard.activeOrders'), value: buyerOrders.length, icon: ClipboardList, color: 'bg-blue-100 text-blue-700' },
    { label: t('buyerDashboard.pendingOffers'), value: pendingOffers.length, icon: Hand, color: 'bg-purple-100 text-purple-700' },
    { label: t('buyerDashboard.activeDeliveries'), value: activeDeliveriesCount, icon: TruckIcon, color: 'bg-earth-100 text-earth-700' },
  ];

  const statsWithIcons = stats.map((s, i) => ({
    ...s,
    icon: s.icon
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}, {user?.name}!</h1>
        <p className="text-gray-600 mt-1 capitalize">{t('dashboard.welcome')} {user?.role} {t('dashboard.dashboard')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsWithIcons.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t('buyerDashboard.quickActions') || 'Quick Actions'}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <h2 className="text-lg font-bold text-gray-900">{t('buyerDashboard.pendingActions') || 'Pending Actions'}</h2>
          </div>
          <div className="space-y-3">
            {pendingOffers.length > 0 && (
              <Link to="/offers" className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition">
                <Hand className="h-6 w-6 text-purple-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t('buyerDashboard.pendingOffersLabel') || 'Pending Offers'}</p>
                  <p className="text-sm text-gray-500">{pendingOffers.length} {t('buyerDashboard.offersAwaitingResponse') || 'offer(s) awaiting farmer response'}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            )}
            {buyerOrders.filter(o => o.status === 'pending').length > 0 && (
              <Link to="/my-orders" className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition">
                <Clock className="h-6 w-6 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t('buyerDashboard.ordersPendingConfirmation') || 'Orders Pending Confirmation'}</p>
                  <p className="text-sm text-gray-500">{buyerOrders.filter(o => o.status === 'pending').length} {t('buyerDashboard.ordersAwaitingConfirmation') || 'order(s) awaiting farmer confirmation'}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            )}
            {ordersAwaitingTransport > 0 && (
              <Link to="/transport" className="flex items-center gap-3 p-4 bg-earth-50 border border-earth-200 rounded-xl hover:bg-earth-100 transition">
                <TruckIcon className="h-6 w-6 text-earth-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t('buyerDashboard.ordersAwaitingTransport') || 'Orders Awaiting Transport'}</p>
                  <p className="text-sm text-gray-500">{ordersAwaitingTransport} {t('buyerDashboard.ordersNeedTransport') || 'order(s) need transport arranged'}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            )}
            {activeDeliveriesCount > 0 && (
              <Link to="/my-orders" className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition">
                <TruckIcon className="h-6 w-6 text-blue-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t('buyerDashboard.activeDeliveriesLabel') || 'Active Deliveries'}</p>
                  <p className="text-sm text-gray-500">{activeDeliveriesCount} {t('buyerDashboard.deliveriesInProgress') || 'deliver(ies) in progress'}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            )}
            {pendingOffers.length === 0 && buyerOrders.filter(o => o.status === 'pending').length === 0 && ordersAwaitingTransport === 0 && activeDeliveriesCount === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-900 mb-1">{t('buyerDashboard.allCaughtUp') || 'All caught up!'}</p>
                <p className="text-sm">{t('buyerDashboard.noPendingActions') || 'No pending actions at the moment'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{t('buyerDashboard.recentMarketplace') || 'Recent Marketplace Crops'}</h2>
              <Link to="/marketplace" className="text-agro-600 text-sm font-medium flex items-center gap-1 hover:underline">
                {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y">
              {(data?.recentCrops || []).map(crop => (
                <Link key={crop.id} to={`/marketplace/${crop.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                  <div className="h-12 w-12 rounded-xl bg-agro-50 flex items-center justify-center">
                    <CategoryIconLarge category={crop.category} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{crop.name}</p>
                    <p className="text-sm text-gray-500">{crop.farmer_name} · {crop.location || 'India'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-agro-700">₹{crop.price_per_unit}/{crop.unit}</p>
                    <p className="text-xs text-gray-500">{crop.quantity} {crop.unit} available</p>
                  </div>
                </Link>
              ))}
              {(!data?.recentCrops || data.recentCrops.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-900 mb-1">{t('buyerDashboard.noCropsAvailable') || 'No crops available'}</p>
                  <p className="text-sm">{t('buyerDashboard.checkBackLater') || 'Check back later for new listings'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-agro-500 to-agro-700 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">{t('buyerDashboard.marketInsights') || 'Market Insights'}</h3>
            <p className="text-agro-100 text-sm mb-4">{t('buyerDashboard.marketInsightsDesc') || 'Get market trends and price analysis for better sourcing decisions'}</p>
            <Link to="/market-advice" className="inline-flex items-center gap-2 bg-white text-agro-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-agro-50 transition">
              <TrendingUp className="h-4 w-4" /> {t('buyerDashboard.viewInsights') || 'View Insights'}
            </Link>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">{t('buyerDashboard.priceAlerts') || 'Price Alerts'}</h3>
            <p className="text-blue-100 text-sm mb-4">{t('buyerDashboard.priceAlertsDesc') || 'Get notified when crop prices cross your thresholds'}</p>
            <Link to="/price-alerts" className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition">
              <TrendingUp className="h-4 w-4" /> {t('buyerDashboard.manageAlerts') || 'Manage Alerts'}
            </Link>
          </div>

          {activeDeliveriesCount > 0 && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">{t('buyerDashboard.activeDeliveriesTitle') || 'Active Deliveries'}</h3>
              <p className="text-blue-100 text-sm mb-4">{activeDeliveriesCount} {t('buyerDashboard.deliveriesInProgress') || 'delivery(ies) in progress'}</p>
              <Link to="/my-orders" className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition">
                <TruckIcon className="h-4 w-4" /> {t('buyerDashboard.trackDeliveries') || 'Track Deliveries'}
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('buyerDashboard.categoryPrices') || 'Category Prices'}</h2>
        <div className="space-y-3">
          {(data?.categories || []).map((cat, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  <CategoryIcon category={cat.category} />
                </span>
                <span className="text-sm font-medium capitalize">{cat.category}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">₹{Number(cat.avg_price).toFixed(2)}/kg</p>
                <p className="text-xs text-gray-500">{cat.count} {t('marketplace.listings') || 'listings'}</p>
              </div>
            </div>
          ))}
          {(!data?.categories || data.categories.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">{t('buyerDashboard.noCategoryData') || 'No category data yet'}</p>
          )}
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