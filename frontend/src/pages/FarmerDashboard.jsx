import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Truck, Wheat, Users, ArrowRight, AlertTriangle, Package, Plus, Hand, AlertCircle, ClipboardList, DollarSign, Send, Clock, SendHorizontal, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';
import { calculateNetReturn, formatCurrency } from '../utils/netReturn';

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
  return <Icon className="h-6 w-6 text-agro-600" />;
};

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [spoilageAlerts, setSpoilageAlerts] = useState([]);
  const [pendingOffers, setPendingOffers] = useState([]);
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/market/dashboard').catch(() => ({ stats: {}, recentCrops: [], categories: [] })),
      api.get('/spoilage/farmer').catch(() => []),
      api.get('/offers/farmer').catch(() => []),
      api.get('/orders/farmer-orders').catch(() => []),
    ]).then(([dashboardData, spoilage, offers, orders]) => {
      setData(dashboardData);
      setSpoilageAlerts(spoilage);
      setPendingOffers(offers.filter(o => o.status === 'pending'));
      setFarmerOrders(orders.filter(o => ['pending', 'confirmed'].includes(o.status)));
      setLoading(false);
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 17) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

  const quickActions = [
    { label: t('farmerDashboard.addCrop') || 'Add New Crop', to: '/my-crops', icon: Plus, color: 'bg-agro-100 text-agro-700' },
    { label: t('farmerDashboard.viewMarketplace') || 'View Marketplace', to: '/marketplace', icon: ShoppingCart, color: 'bg-blue-100 text-blue-700' },
    { label: t('farmerDashboard.viewOffers') || 'View Offers', to: '/offers', icon: Hand, color: 'bg-purple-100 text-purple-700' },
    { label: t('farmerDashboard.spoilageAlerts') || 'Spoilage Alerts', to: '/spoilage-alerts', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700' },
  ];

  const activeSpoilageCount = spoilageAlerts.filter(a => a.status === 'active').length;
  const criticalSpoilageCount = spoilageAlerts.filter(a => a.status === 'active' && a.severity === 'critical').length;

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div>
    </div>
  );

  const stats = [
    { label: t('dashboard.availableCrops'), value: data?.stats?.totalCrops || 0, icon: Wheat, color: 'bg-agro-100 text-agro-700' },
    { label: t('dashboard.totalOrders'), value: data?.stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-blue-100 text-blue-700' },
    { label: t('farmerDashboard.pendingOffers') || 'Pending Offers', value: pendingOffers.length, icon: Hand, color: 'bg-purple-100 text-purple-700' },
    { label: t('farmerDashboard.spoilageAlerts') || 'Spoilage Alerts', value: activeSpoilageCount, icon: AlertTriangle, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}, {user?.name}!</h1>
        <p className="text-gray-600 mt-1 capitalize">{t('dashboard.welcome')} {user?.role} {t('dashboard.dashboard')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
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
            <h2 className="text-lg font-bold text-gray-900">{t('farmerDashboard.quickActions') || 'Quick Actions'}</h2>
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
            <h2 className="text-lg font-bold text-gray-900">{t('farmerDashboard.pendingActions') || 'Pending Actions'}</h2>
          </div>
          <div className="space-y-3">
            {pendingOffers.length > 0 && (
              <Link to="/offers" className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition">
                <Hand className="h-6 w-6 text-purple-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t('farmerDashboard.pendingOffersLabel') || 'Pending Offers'}</p>
                  <p className="text-sm text-gray-500">{pendingOffers.length} {t('farmerDashboard.offersAwaitingResponse') || 'offer(s) awaiting your response'}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            )}
            {farmerOrders.length > 0 && (
              <Link to="/farmer-orders" className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition">
                <ClipboardList className="h-6 w-6 text-blue-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t('farmerDashboard.ordersAwaitingAction') || 'Orders Awaiting Action'}</p>
                  <p className="text-sm text-gray-500">{farmerOrders.length} {t('farmerDashboard.ordersNeedConfirmation') || 'order(s) need confirmation'}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            )}
            {activeSpoilageCount > 0 && (
              <Link to="/spoilage-alerts" className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t('farmerDashboard.spoilageAlertsLabel') || 'Spoilage Alerts'}</p>
                  <p className="text-sm text-gray-500">{activeSpoilageCount} {t('farmerDashboard.activeAlerts') || 'active alert(s)'} {criticalSpoilageCount > 0 ? `(${criticalSpoilageCount} ${t('farmerDashboard.critical') || 'critical'})` : ''}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            )}
            {pendingOffers.length === 0 && farmerOrders.length === 0 && activeSpoilageCount === 0 && (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-400" />
                <p className="font-semibold text-gray-900 mb-1">{t('farmerDashboard.allCaughtUp') || 'All caught up!'}</p>
                <p className="text-sm">{t('farmerDashboard.noPendingActions') || 'No pending actions at the moment'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{t('farmerDashboard.myCrops') || 'My Crops'}</h2>
              <Link to="/my-crops" className="text-agro-600 text-sm font-medium flex items-center gap-1 hover:underline">
                {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y">
              {(data?.recentCrops || []).map(crop => {
                const sellingPrice = crop.price_per_unit;
                const transportCost = 5;
                const platformFee = sellingPrice * 0.02;
                const netReturn = sellingPrice - transportCost - platformFee;
                const netReturnPercent = ((netReturn / sellingPrice) * 100).toFixed(1);

                return (
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
                      <p className="text-xs text-green-600 mt-1">{t('farmerDashboard.netReturn') || 'Net Return'}: ~₹{netReturn.toFixed(1)}/{crop.unit} ({netReturnPercent}%)</p>
                    </div>
                  </Link>
                );
              })}
              {(!data?.recentCrops || data.recentCrops.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  <Wheat className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-900 mb-1">{t('farmerDashboard.noCropsListed') || 'No crops listed yet'}</p>
                  <p className="text-sm">{t('farmerDashboard.addFirstCrop') || 'Add your first crop to start selling'}</p>
                  <Link to="/my-crops" className="mt-3 inline-flex items-center gap-1 text-agro-600 font-medium hover:underline">
                    <Plus className="h-4 w-4" /> {t('farmerDashboard.addCrop') || 'Add New Crop'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-agro-500 to-agro-700 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">{t('farmerDashboard.netReturnCalculator') || 'Net Return Calculator'}</h3>
            <p className="text-agro-100 text-sm mb-4">{t('farmerDashboard.netReturnDesc') || 'See what you actually earn after costs'}</p>
            <Link to="/market-advice" className="inline-flex items-center gap-2 bg-white text-agro-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-agro-50 transition">
              <TrendingUp className="h-4 w-4" /> {t('farmerDashboard.learnMore') || 'Learn More'}
            </Link>
          </div>

          <div className="bg-gradient-to-br from-earth-500 to-earth-700 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">{t('farmerDashboard.needTransport') || 'Need Transport?'}</h3>
            <p className="text-earth-100 text-sm mb-4">{t('farmerDashboard.transportDesc') || 'Book verified transporters for your crop deliveries with real-time tracking.'}</p>
            <Link to="/transport" className="inline-flex items-center gap-2 bg-white text-earth-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-earth-50 transition">
              <Truck className="h-4 w-4" /> {t('farmerDashboard.bookTransport') || 'Book Transport'}
            </Link>
          </div>

          {criticalSpoilageCount > 0 && (
            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> {t('farmerDashboard.urgentSpoilageAlert') || 'Urgent: Spoilage Alert!'}
              </h3>
              <p className="text-red-100 text-sm mb-4">{criticalSpoilageCount} {t('farmerDashboard.cropsCritical') || 'crop(s) need immediate attention'}</p>
              <Link to="/spoilage-alerts" className="inline-flex items-center gap-2 bg-white text-red-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition">
                <AlertTriangle className="h-4 w-4" /> {t('farmerDashboard.viewAlerts') || 'View Alerts'}
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('farmerDashboard.categoryPrices') || 'Category Prices'}</h2>
        <div className="space-y-3">
          {(data?.categories || []).map((cat, i) => (
            <div key={i} className="flex items_center justify-between">
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
            <p className="text-sm text-gray-500 text-center py-4">{t('farmerDashboard.noCategoryData') || 'No category data yet'}</p>
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