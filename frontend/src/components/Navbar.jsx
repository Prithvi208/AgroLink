import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, LogOut, Menu, X, Wheat, ChevronDown, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';

const LANG_LABELS = { en: 'English', hi: 'हिंदी', mr: 'मराठी' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, lang, changeLang } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    console.log('[Navbar] Fetching unread count...');
    api.get('/notifications/unread-count')
      .then(d => {
        console.log('[Navbar] Unread count:', d.count);
        setUnreadCount(d.count);
      })
      .catch(err => console.warn('[Navbar] Unread count fetch failed:', err.message));
    const interval = setInterval(() => {
      api.get('/notifications/unread-count')
        .then(d => setUnreadCount(d.count))
        .catch(err => console.warn('[Navbar] Unread count interval failed:', err.message));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    { to: '/', label: t('nav.dashboard'), roles: ['farmer', 'buyer', 'transporter'] },
    { to: '/marketplace', label: t('nav.marketplace'), roles: ['farmer', 'buyer', 'transporter'] },
    { to: '/my-crops', label: t('nav.myCrops'), roles: ['farmer'] },
    { to: '/farmer-orders', label: t('nav.ordersReceived'), roles: ['farmer'] },
    { to: '/my-orders', label: t('nav.myOrders'), roles: ['buyer'] },
    { to: '/transport', label: t('nav.transport'), roles: ['transporter', 'buyer', 'farmer'] },
    { to: '/market-advice', label: t('nav.aiAdvice'), roles: ['farmer', 'buyer'] },
    { to: '/carpool', label: t('nav.carpool'), roles: ['farmer', 'buyer', 'transporter'] },
    { to: '/payments', label: t('nav.payments'), roles: ['farmer', 'buyer', 'transporter'] },
  ];

  const farmerExtra = [1].map(() => ({ to: '/price-alerts', label: t('nav.priceAlerts'), roles: ['farmer'] }));

  const allLinks = [...links, ...farmerExtra];
  const filteredLinks = allLinks.filter(l => l.roles.includes(user?.role));

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2 text-agro-700 font-bold text-xl">
            <Wheat className="h-7 w-7" />
            <span>{t('app.name')}</span>
          </NavLink>

          <div className="hidden md:flex items-center gap-1">
            {filteredLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-agro-100 text-agro-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="p-2 rounded-lg hover:bg-gray-100 flex items-center gap-1">
                <Globe className="h-5 w-5 text-gray-600" />
                <span className="hidden md:block text-sm text-gray-600">{LANG_LABELS[lang] || 'English'}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border py-1 z-50">
                  {Object.entries(LANG_LABELS).map(([code, label]) => (
                    <button key={code} onClick={() => { changeLang(code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${lang === code ? 'text-agro-700 font-semibold' : 'text-gray-700'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => navigate('/messages')} className="p-2 rounded-lg hover:bg-gray-100">
              <MessageSquare className="h-5 w-5 text-gray-600" />
            </button>

            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                <div className="h-8 w-8 bg-agro-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white pb-4">
          {filteredLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `block px-4 py-3 text-sm font-medium ${isActive ? 'bg-agro-50 text-agro-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              {l.label}
            </NavLink>
          ))}
          <div className="px-4 py-3 border-t">
            <p className="text-xs text-gray-500 mb-2">Language / भाषा</p>
            <div className="flex gap-2">
              {Object.entries(LANG_LABELS).map(([code, label]) => (
                <button key={code} onClick={() => changeLang(code)}
                  className={`text-sm px-3 py-1 rounded-lg ${lang === code ? 'bg-agro-100 text-agro-700 font-semibold' : 'bg-gray-100'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}