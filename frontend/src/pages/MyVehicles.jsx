import { useState, useEffect } from 'react';
import { Truck, Plus, Edit2, Trash2, X, CheckCircle2, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const vehicleTypes = ['truck', 'pickup', 'van', 'trailer', 'tempo'];
const statusColors = { available: 'bg-green-100 text-green-700', active: 'bg-blue-100 text-blue-700', maintenance: 'bg-yellow-100 text-yellow-700', retired: 'bg-red-100 text-red-700' };

export default function MyVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ make: '', model: '', vehicle_type: 'truck', capacity_tons: '', license_plate: '', fuel_type: '', insurance_expiry: '' });

  const loadVehicles = () => { api.get('/transporter/vehicles').then(d => { setVehicles(d); setLoading(false); }).catch(() => setLoading(false)); };

  useEffect(() => { loadVehicles(); }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/transporter/vehicles/${editing.id}`, form);
      } else {
        await api.post('/transporter/vehicles', form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ make: '', model: '', vehicle_type: 'truck', capacity_tons: '', license_plate: '', fuel_type: '', insurance_expiry: '' });
      loadVehicles();
    } catch (err) { alert(err.message); }
  };

  const handleEdit = (v) => { setEditing(v); setForm({ make: v.make, model: v.model, vehicle_type: v.vehicle_type, capacity_tons: v.capacity_tons, license_plate: v.license_plate || '', fuel_type: v.fuel_type || '', insurance_expiry: v.insurance_expiry || '' }); setShowForm(true); };

  const handleDelete = async (id) => { if (!confirm('Remove this vehicle?')) return; await api.delete(`/transporter/vehicles/${id}`); loadVehicles(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1><p className="text-gray-600 mt-1">Manage your fleet</p></div>
        <button onClick={() => { setEditing(null); setForm({ make: '', model: '', vehicle_type: 'truck', capacity_tons: '', license_plate: '', fuel_type: '', insurance_expiry: '' }); setShowForm(true); }} className="bg-agro-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-agro-700 transition flex items-center gap-2"><Plus className="h-4 w-4" /> Add Vehicle</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">{editing ? 'Edit Vehicle' : 'Add Vehicle'}</h2><button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="Make" value={form.make} onChange={e => update('make', e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" /><input type="text" placeholder="Model" value={form.model} onChange={e => update('model', e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" /></div>
              <div className="grid grid-cols-2 gap-3"><select value={form.vehicle_type} onChange={e => update('vehicle_type', e.target.value)} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500">{vehicleTypes.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}</select><input type="number" step="0.1" placeholder="Capacity (tons)" value={form.capacity_tons} onChange={e => update('capacity_tons', e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" /></div>
              <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="License Plate" value={form.license_plate} onChange={e => update('license_plate', e.target.value)} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" /><input type="text" placeholder="Fuel Type" value={form.fuel_type} onChange={e => update('fuel_type', e.target.value)} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" /></div>
              <button type="submit" className="w-full bg-agro-600 text-white py-3 rounded-xl font-semibold hover:bg-agro-700 transition">{editing ? 'Update' : 'Add'} Vehicle</button>
            </form>
          </div>
        </div>
      )}

      {vehicles.length === 0 ? <div className="text-center py-16"><Wrench className="h-16 w-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">No vehicles added yet</p></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(v => (
            <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3"><div className="h-10 w-10 bg-agro-50 rounded-lg flex items-center justify-center"><Truck className="h-5 w-5 text-agro-700" /></div><span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[v.status] || 'bg-gray-100 text-gray-700'}`}>{v.status}</span></div>
              <h3 className="font-bold text-gray-900">{v.make} {v.model}</h3>
              <p className="text-sm text-gray-500 capitalize">{v.vehicle_type} · {v.capacity_tons} tons</p>
              {v.license_plate && <p className="text-sm text-gray-500">Plate: {v.license_plate}</p>}
              <div className="flex gap-2 mt-3"><button onClick={() => handleEdit(v)} className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition"><Edit2 className="h-4 w-4" /></button><button onClick={() => handleDelete(v.id)} className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"><Trash2 className="h-4 w-4" /></button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
