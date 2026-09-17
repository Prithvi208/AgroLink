import { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Wheat, ShoppingCart, Truck, Car, Lightbulb,
  TrendingUp, Wallet, Package, Bell, User,
  LogOut, Menu, X, MessageSquare, Globe,
  Wrench, BarChart3, Route, FileText, Clock, CheckCircle2, Navigation, XCircle, Hand, AlertTriangle, RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';

const LANG_LABELS = { en: 'EN', hi: 'हिंदी', mr: 'मराठी' };

function getNavItems(t, user) {
  const role = user?.role;

  if (role === 'transporter') {
    return {
      main: [
        { to: '/transporter/dashboard', label: t('nav.dashboard') || 'Dashboard', icon: Home },
        { to: '/transporter/requests', label: 'Transport Requests', icon: FileText },
        { to: '/transporter/trips', label: 'My Trips', icon: Route },
        { to: '/transporter/active', label: 'Active Delivery', icon: Navigation },
      ],
      manage: [
        { to: '/transporter/vehicles', label: 'My Vehicles', icon: Wrench },
        { to: '/transporter/earnings', label: 'Earnings', icon: Wallet },
        { to: '/transporter/performance', label: 'Performance', icon: BarChart3 },
      ],
      account: [
        { to: '/notifications', label: t('nav.notifications') || 'Notifications', icon: Bell },
        { to: '/messages', label: t('nav.messages') || 'Messages', icon: MessageSquare },
        { to: '/profile', label: t('nav.profile') || 'Profile', icon: User },
      ],
    };
  }

  return {
    main: [
      { to: '/', label: t('nav.dashboard') || 'Dashboard', icon: Home, roles: ['farmer', 'buyer', 'transporter'] },
      { to: '/my-crops', label: t('nav.myCrops') || 'My Crops', icon: Wheat, roles: ['farmer'] },
      { to: '/marketplace', label: t('nav.marketplace') || 'Marketplace', icon: ShoppingCart, roles: ['farmer', 'buyer', 'transporter'] },
      { to: '/transport', label: t('nav.transport') || 'Transport', icon: Truck, roles: ['buyer', 'transporter'] },
      { to: '/carpool', label: t('nav.carpool') || 'Carpool', icon: Car, roles: ['farmer', 'transporter'] },
    ],
    tools: [
      { to: '/offers', label: t('offers.title') || 'Offers', icon: Hand, roles: ['farmer'] },
      { to: '/market-advice', label: t('marketAdvice.title') || 'Market Advisor', icon: Lightbulb, roles: ['farmer', 'buyer'] },
      { to: '/price-alerts', label: t('nav.priceAlerts') || 'Price Alerts', icon: TrendingUp, roles: ['farmer', 'buyer'] },
      { to: '/spoilage-alerts', label: t('spoilage.title') || 'Spoilage Alerts', icon: AlertTriangle, roles: ['farmer'] },
      { to: '/payments', label: t('nav.payments') || 'Payments', icon: Wallet, roles: ['farmer', 'buyer', 'transporter'] },
      { to: '/my-orders', label: t('nav.myOrders') || 'Orders', icon: Package, roles: ['buyer'] },
      { to: '/farmer-orders', label: t('nav.ordersReceived') || 'Orders', icon: Package, roles: ['farmer'] },
    ],
    account: [
      { to: '/notifications', label: t('nav.notifications') || 'Notifications', icon: Bell, roles: ['farmer', 'buyer', 'transporter'] },
      { to: '/profile', label: t('nav.profile') || 'Profile', icon: User, roles: ['farmer', 'buyer', 'transporter'] },
    ],
  };
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t, lang, changeLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navItems = useMemo(() => getNavItems(t, user), [t, user]);

  useEffect(() => {
    console.log('[Sidebar] Fetching unread count...');
    api.get('/notifications/unread-count')
      .then(d => {
        console.log('[Sidebar] Unread count:', d.count);
        setUnreadCount(d.count);
      })
      .catch(err => console.warn('[Sidebar] Unread count fetch failed:', err.message));
    const interval = setInterval(() => {
      api.get('/notifications/unread-count')
        .then(d => setUnreadCount(d.count))
        .catch(err => console.warn('[Sidebar] Unread count interval failed:', err.message));
    }, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isTransporter = user?.role === 'transporter';

  const filteredMain = isTransporter ? navItems.main : navItems.main.filter(l => l.roles?.includes(user?.role));
  const filteredManage = isTransporter ? navItems.manage : navItems.tools?.filter(l => l.roles?.includes(user?.role)) || [];
  const filteredAccount = navItems.account.filter(l => l.roles?.includes(user?.role));

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-white border-b shadow-sm z-50 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          <Home className="h-6 w-6 text-agro-600" />
          <span className="font-bold text-agro-700">{t('app.name')}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-lg hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button onClick={() => navigate('/messages')} className="p-2 rounded-lg hover:bg-gray-100">
            <MessageSquare className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Mobile close */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <span className="font-bold text-agro-700">{t('app.name')}</span>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Brand */}
        <div className="p-5 border-b flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 bg-agro-500 rounded-xl flex items-center justify-center">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-agro-800">{t('app.name')}</h1>
            <p className="text-xs text-gray-500 capitalize">{user?.role} Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{isTransporter ? 'Main' : 'Main'}</p>
            <div className="space-y-1">
              {filteredMain.map(item => (
                <NavLink key={item.to} to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-agro-100 text-agro-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {isTransporter && (
            <div>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Manage</p>
              <div className="space-y-1">
                {filteredManage.map(item => (
                  <NavLink key={item.to} to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-agro-100 text-agro-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {!isTransporter && filteredManage.length > 0 && (
            <div>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Tools</p>
              <div className="space-y-1">
                {filteredManage.map(item => (
                  <NavLink key={item.to} to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-agro-100 text-agro-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Account</p>
            <div className="space-y-1">
              {filteredAccount.map(item => (
                <NavLink key={item.to} to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-agro-100 text-agro-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                  {item.to === '/notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t space-y-1 shrink-0">
          <div className="flex items-center gap-1 px-3">
            <button onClick={() => { navigate('/messages'); setMobileOpen(false); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              <MessageSquare className="h-5 w-5" /> <span className="hidden xl:inline">Messages</span>
            </button>
            <button onClick={() => { changeLang(lang === 'en' ? 'hi' : lang === 'hi' ? 'mr' : 'en'); setMobileOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              <Globe className="h-5 w-5" /> <span className="hidden xl:inline">{LANG_LABELS[lang]}</span>
            </button>
          </div>
          <button onClick={() => { handleLogout(); setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}