import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Truck, Wheat, Users, ArrowRight, AlertTriangle, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';
import { formatCurrency, formatPerUnit } from '../utils/netReturn';

const categoryIcons = {
  grains: '🌾', vegetables: '🥬', fruits: '🍎', spices: '🌶️', dairy: '🥛', pulses: '🫘', cotton: '🧵', sugarcane: '🍬', default: '🌱'
};

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [spoilageAlerts, setSpoilageAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/market/dashboard').catch(() => ({ stats: {}, recentCrops: [], categories: [] })),
    ]).then(([dashboardData]) => {
      setData(dashboardData);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div>
    </div>
  );

  const stats = [
    { label: t('dashboard.availableCrops'), value: data?.stats?.totalCrops || 0, icon: Wheat, color: 'bg-agro-100 text-agro-700' },
    { label: t('dashboard.totalOrders'), value: data?.stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-blue-100 text-blue-700' },
    { label: t('dashboard.farmers'), value: data?.stats?.totalFarmers || 0, icon: Users, color: 'bg-earth-100 text-earth-700' },
    { label: t('dashboard.transporters'), value: data?.stats?.totalTransporters || 0, icon: Truck, color: 'bg-purple-100 text-purple-700' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 17) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{t('dashboard.recentCrops')}</h2>
              <Link to="/marketplace" className="text-agro-600 text-sm font-medium flex items-center gap-1 hover:underline">
                {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y">
              {(data?.recentCrops || []).map(crop => (
                <Link key={crop.id} to={`/marketplace/${crop.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                  <div className="h-12 w-12 rounded-xl bg-agro-50 flex items-center justify-center text-2xl">
                    {categoryIcons[crop.category?.toLowerCase()] || categoryIcons.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{crop.name}</p>
                    <p className="text-sm text-gray-500">{crop.farmer_name} · {crop.location || 'India'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-agro-700">{formatPerUnit(crop.price_per_unit, crop.unit)}</p>
                    <p className="text-xs text-gray-500">{crop.quantity} {crop.unit} available</p>
                  </div>
                </Link>
              ))}
              {(!data?.recentCrops || data.recentCrops.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  <Wheat className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No crops listed yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Category Prices</h2>
            <div className="space-y-3">
              {(data?.categories || []).map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryIcons[cat.category?.toLowerCase()] || categoryIcons.default}</span>
                    <span className="text-sm font-medium capitalize">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatPerUnit(cat.avg_price)}</p>
                    <p className="text-xs text-gray-500">{cat.count} listings</p>
                  </div>
                </div>
              ))}
              {(!data?.categories || data.categories.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No category data yet</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-agro-500 to-agro-700 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">AI Market Insights</h3>
            <p className="text-agro-100 text-sm mb-4">Get personalized recommendations for your crops based on market trends, demand patterns, and seasonal analysis.</p>
            <Link to="/market-advice" className="inline-flex items-center gap-2 bg-white text-agro-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-agro-50 transition">
              <TrendingUp className="h-4 w-4" /> {t('marketAdvice.viewAdvice') || 'View Market Advice'}
            </Link>
          </div>

          <div className="bg-gradient-to-br from-earth-500 to-earth-700 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Need Transport?</h3>
            <p className="text-earth-100 text-sm mb-4">Book verified transporters for your crop deliveries with real-time tracking.</p>
            <Link to="/transport" className="inline-flex items-center gap-2 bg-white text-earth-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-earth-50 transition">
              <Truck className="h-4 w-4" /> Book Transport
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
