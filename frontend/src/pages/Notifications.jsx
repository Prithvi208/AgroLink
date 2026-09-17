import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCheck, Package, Truck, AlertTriangle, Info } from 'lucide-react';
import { api } from '../utils/api';

const typeIcons = { info: Info, order: Package, transport: Truck, alert: AlertTriangle, spoilage: AlertTriangle };
const typeColors = { info: 'bg-blue-100 text-blue-600', order: 'bg-agro-100 text-agro-600', transport: 'bg-purple-100 text-purple-600', alert: 'bg-yellow-100 text-yellow-600', spoilage: 'bg-red-100 text-red-600' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(setNotifications).catch(() => setNotifications([])).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="h-8 w-8 text-agro-600" /> Notifications
          </h1>
          <p className="text-gray-600 mt-1">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16"><BellOff className="h-16 w-16 mx-auto mb-4 text-gray-300" /><h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3><p className="text-gray-500">You're all caught up!</p></div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const Icon = typeIcons[n.type] || Info;
            return (
              <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                className={`bg-white rounded-2xl border p-5 flex items-start gap-4 cursor-pointer transition hover:shadow-md ${!n.read ? 'border-agro-200 bg-agro-50/30' : 'border-gray-100'}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${typeColors[n.type] || 'bg-gray-100 text-gray-600'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{n.title}</h3>
                    {!n.read && <span className="h-2 w-2 bg-agro-500 rounded-full" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}