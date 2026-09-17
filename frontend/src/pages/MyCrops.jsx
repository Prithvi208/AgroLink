import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Wheat, X } from 'lucide-react';
import { api } from '../utils/api';

const categories = ['grains', 'vegetables', 'fruits', 'spices', 'dairy', 'pulses', 'cotton', 'sugarcane'];
const categoryIcons = { grains: '🌾', vegetables: '🥬', fruits: '🍎', spices: '🌶️', dairy: '🥛', pulses: '🫘', cotton: '🧵', sugarcane: '🍬' };

export default function MyCrops() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCrop, setEditCrop] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'grains', quantity: '', unit: 'kg', price_per_unit: '', description: '', location: '', harvest_date: '' });

  const loadCrops = () => {
    api.get('/crops/my').then(setCrops).catch(() => setCrops([])).finally(() => setLoading(false));
  };

  useEffect(() => { loadCrops(); }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCrop) {
        await api.put(`/crops/${editCrop.id}`, form);
      } else {
        await api.post('/crops', form);
      }
      setShowForm(false);
      setEditCrop(null);
      setForm({ name: '', category: 'grains', quantity: '', unit: 'kg', price_per_unit: '', description: '', location: '', harvest_date: '' });
      loadCrops();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (crop) => {
    setEditCrop(crop);
    setForm({ name: crop.name, category: crop.category, quantity: crop.quantity, unit: crop.unit, price_per_unit: crop.price_per_unit, description: crop.description || '', location: crop.location || '', harvest_date: crop.harvest_date || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this crop?')) return;
    await api.delete(`/crops/${id}`);
    loadCrops();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Crops</h1>
          <p className="text-gray-600 mt-1">Manage your listed crops</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditCrop(null); setForm({ name: '', category: 'grains', quantity: '', unit: 'kg', price_per_unit: '', description: '', location: '', harvest_date: '' }); }}
          className="bg-agro-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-agro-700 transition flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add Crop
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editCrop ? 'Edit Crop' : 'Add New Crop'}</h2>
              <button onClick={() => { setShowForm(false); setEditCrop(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Crop name" value={form.name} onChange={e => update('name', e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500">
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => update('quantity', e.target.value)} required className="px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
                <select value={form.unit} onChange={e => update('unit', e.target.value)} className="px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500">
                  <option value="kg">kg</option><option value="ton">ton</option><option value="quintal">quintal</option><option value="piece">piece</option>
                </select>
                <input type="number" step="0.01" placeholder="Price/unit" value={form.price_per_unit} onChange={e => update('price_per_unit', e.target.value)} required className="px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              </div>
              <textarea placeholder="Description (optional)" value={form.description} onChange={e => update('description', e.target.value)} rows={3} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Location" value={form.location} onChange={e => update('location', e.target.value)} className="px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
                <input type="date" value={form.harvest_date} onChange={e => update('harvest_date', e.target.value)} className="px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              </div>
              <button type="submit" className="w-full bg-agro-600 text-white py-3 rounded-xl font-semibold hover:bg-agro-700 transition">
                {editCrop ? 'Update Crop' : 'Add Crop'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>
      ) : crops.length === 0 ? (
        <div className="text-center py-16"><Wheat className="h-16 w-16 mx-auto mb-4 text-gray-300" /><h3 className="text-xl font-bold text-gray-900 mb-2">No crops listed yet</h3><p className="text-gray-500">Click "Add Crop" to list your first crop</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map(crop => (
            <div key={crop.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{categoryIcons[crop.category] || '🌱'}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{crop.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${crop.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{crop.status}</span>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p>{crop.quantity} {crop.unit} @ ${crop.price_per_unit}/{crop.unit}</p>
                <p className="font-bold text-agro-700">${(crop.quantity * crop.price_per_unit).toFixed(2)} total</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(crop)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50 transition"><Edit2 className="h-4 w-4" /> Edit</button>
                <button onClick={() => handleDelete(crop.id)} className="px-3 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
