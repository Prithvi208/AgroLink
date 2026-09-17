import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Truck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(d => { setInfo(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
      <p className="text-gray-600 mb-8">Your account details</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-20 w-20 bg-agro-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
            {info?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{info?.name}</h2>
            <span className="bg-agro-100 text-agro-700 text-sm font-medium px-3 py-1 rounded-lg capitalize">{info?.role}</span>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: info?.email },
            { icon: Phone, label: 'Phone', value: info?.phone || 'Not set' },
            { icon: MapPin, label: 'Location', value: info?.location || 'Not set' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <item.icon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="font-medium text-gray-900">{item.value}</p>
              </div>
            </div>
          ))}

          {info?.role === 'transporter' && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Truck className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Vehicle Type</p>
                <p className="font-medium text-gray-900 capitalize">{info?.vehicle_type || 'N/A'} · {info?.vehicle_capacity || ''}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <Shield className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Member Since</p>
              <p className="font-medium text-gray-900">{new Date(info?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}