import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Mail, Lock, User, Phone, MapPin, Truck, Tractor, ShoppingCart, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '', password: '', confirmPassword: '',
    role: 'farmer', vehicle_type: '', vehicle_capacity: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const roles = [
    { value: 'farmer', label: t('register.farmer'), icon: Tractor, desc: 'Sell crops & produce' },
    { value: 'buyer', label: t('register.buyer'), icon: ShoppingCart, desc: 'Purchase agricultural products' },
    { value: 'transporter', label: t('register.transporter'), icon: Truck, desc: 'Provide logistics services' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agro-50 to-earth-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wheat className="h-12 w-12 text-agro-600" />
            <h1 className="text-4xl font-bold text-agro-800">{t('app.name')}</h1>
          </div>
          <p className="text-gray-600">{t('register.role')} - {t('app.tagline')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('register.title')}</h2>

          {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {roles.map(r => (
                <button key={r.value} type="button" onClick={() => update('role', r.value)}
                  className={`p-3 rounded-xl border-2 text-center transition ${form.role === r.value ? 'border-agro-500 bg-agro-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <r.icon className={`h-6 w-6 mx-auto mb-1 ${form.role === r.value ? 'text-agro-600' : 'text-gray-400'}`} />
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none text-sm"
                    placeholder="John Doe" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none text-sm"
                    placeholder="you@example.com" required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none text-sm"
                    placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="text" value={form.location} onChange={e => update('location', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none text-sm"
                    placeholder="Punjab, India" />
                </div>
              </div>
            </div>

            {form.role === 'transporter' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select value={form.vehicle_type} onChange={e => update('vehicle_type', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none text-sm">
                    <option value="">Select</option>
                    <option value="truck">Truck</option>
                    <option value="pickup">Pickup</option>
                    <option value="van">Van</option>
                    <option value="trailer">Trailer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (tons)</label>
                  <input type="text" value={form.vehicle_capacity} onChange={e => update('vehicle_capacity', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none text-sm"
                    placeholder="5 tons" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none text-sm"
                    placeholder="••••••••" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none text-sm"
                    placeholder="••••••••" required />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-agro-600 text-white py-3 rounded-xl font-semibold hover:bg-agro-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
              <UserPlus className="h-5 w-5" />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-agro-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
