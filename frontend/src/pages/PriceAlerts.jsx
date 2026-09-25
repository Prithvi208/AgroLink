import { useState, useEffect } from 'react';
import { Bell, Plus, X, Trash2, Search, CheckCircle2, BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/netReturn';

const cropOptions = ['rice', 'wheat', 'tomato', 'cotton', 'potato', 'onion', 'mango', 'sugarcane'];

export default function PriceAlerts() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ crop_name: 'rice', threshold_price: '', condition: 'above', alert_on: 'crop_price' });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const loadAlerts = () => {
    api.get('/price-alerts').then(setAlerts).catch(() => setAlerts([])).finally(() => setLoading(false));
  };

  useEffect(() => { loadAlerts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/price-alerts', form);
      setShowForm(false);
      setForm({ crop_name: 'rice', threshold_price: '', condition: 'above', alert_on: 'crop_price' });
      loadAlerts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/price-alerts/${id}`);
    loadAlerts();
  };

  const handleToggle = async (alert) => {
    await api.put(`/price-alerts/${alert.id}`, { active: alert.active ? 0 : 1 });
    loadAlerts();
  };

  const handleCheck = async () => {
    setChecking(true);
    setResult(null);
    try {
      const res = await api.post('/price-alerts/check');
      setResult(res);
      loadAlerts();
    } catch (err) {
      alert(t('priceAlerts.checkFailed') || 'Unable to check alerts right now. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BellRing className="h-8 w-8 text-agro-600" /> {t('priceAlerts.title')}
          </h1>
          <p className="text-gray-600 mt-1">{t('priceAlerts.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCheck} disabled={checking}
            className="flex items-center gap-2 px-4 py-2 border-2 border-agro-600 text-agro-700 rounded-xl text-sm font-semibold hover:bg-agro-50 transition disabled:opacity-50">
            <Search className="h-4 w-4" /> {checking ? '...' : t('priceAlerts.checkNow')}
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-agro-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-agro-700 transition">
            <Plus className="h-4 w-4" /> {t('priceAlerts.createAlert')}
          </button>
        </div>
      </div>

      {result && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${result.triggered.length ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600'}`}>
          <CheckCircle2 className="h-5 w-5" />
          {result.triggered.length
            ? `${result.triggered.length} ${t('priceAlerts.triggerMessage')} - check notifications!`
            : `Checked ${result.checked} alert(s) - no threshold crossed yet.`}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('priceAlerts.createAlert')}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('priceAlerts.cropName')}</label>
                <select value={form.crop_name} onChange={e => update('crop_name', e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500">
                  {cropOptions.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('priceAlerts.thresholdPrice')}</label>
                <input type="number" step="0.01" min="0" value={form.threshold_price}
                  onChange={e => update('threshold_price', e.target.value)} required
                  placeholder="e.g. 2.50"
                  className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('priceAlerts.condition')}</label>
                  <select value={form.condition} onChange={e => update('condition', e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500">
                    <option value="above">{t('priceAlerts.above')}</option>
                    <option value="below">{t('priceAlerts.below')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('priceAlerts.alertOn')}</label>
                  <select value={form.alert_on} onChange={e => update('alert_on', e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500">
                    <option value="crop_price">{t('priceAlerts.cropPrice')}</option>
                    <option value="market_price">{t('priceAlerts.marketPrice')}</option>
                  </select>
                </div>
              </div>
              <div className="bg-agro-50 rounded-xl p-4 text-sm text-agro-800">
                {form.alert_on === 'crop_price'
                  ? <>We'll notify you when your listed <b>{form.crop_name}</b> price goes {form.condition} <b>{formatCurrency(form.threshold_price)}</b>.</>
                  : <>We'll notify you when market price of <b>{form.crop_name}</b> goes {form.condition} <b>{formatCurrency(form.threshold_price)}</b>.</>}
              </div>
              <button type="submit" className="w-full bg-agro-600 text-white py-3 rounded-xl font-semibold hover:bg-agro-700 transition">
                {t('common.save')}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('priceAlerts.noAlerts')}</h3>
          <p className="text-gray-500">{t('priceAlerts.noAlertsHint')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={`bg-white rounded-2xl shadow-sm border p-5 flex items-center gap-4 ${alert.active ? 'border-agro-200' : 'border-gray-100 opacity-60'}`}>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${alert.active ? 'bg-agro-100 text-agro-600' : 'bg-gray-100 text-gray-400'}`}>
                <Bell className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 capitalize">{alert.crop_name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${alert.alert_on === 'market_price' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {alert.alert_on === 'market_price' ? t('priceAlerts.marketPrice') : t('priceAlerts.cropPrice')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Price goes <b>{alert.condition}</b> <b className="text-agro-700">{formatCurrency(alert.threshold_price)}</b> {'->'}
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${alert.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {alert.active ? t('priceAlerts.active') : t('priceAlerts.inactive')}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(alert)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${alert.active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-agro-600 text-white hover:bg-agro-700'}`}>
                  {alert.active ? 'Pause' : 'Resume'}
                </button>
                <button onClick={() => handleDelete(alert.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}