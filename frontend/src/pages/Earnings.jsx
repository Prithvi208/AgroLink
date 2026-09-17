import { useState, useEffect } from 'react';
import { DollarSign, Wallet, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Earnings() {
  const [data, setData] = useState({ totalEarnings: 0, pendingEarnings: 0, completedPayments: 0, paymentHistory: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transporter/earnings').then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings & Payments</h1>
      <p className="text-gray-600 mb-8">Track your transport income</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><p className="text-sm text-gray-500">Total Earnings</p><p className="text-3xl font-bold text-green-600 mt-1">₹{data.totalEarnings.toLocaleString()}</p></div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><p className="text-sm text-gray-500">Pending</p><p className="text-3xl font-bold text-yellow-600 mt-1">₹{data.pendingEarnings.toLocaleString()}</p></div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><p className="text-sm text-gray-500">Completed</p><p className="text-3xl font-bold text-blue-600 mt-1">{data.completedPayments} trips</p></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b"><h2 className="font-bold text-gray-900">Transaction History</h2></div>
        <div className="divide-y">
          {data.paymentHistory.length === 0 ? <div className="p-8 text-center text-gray-500">No transactions yet</div> : data.paymentHistory.map(p => (
            <div key={p.order_id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition">
              <div className="h-10 w-10 bg-agro-50 rounded-lg flex items-center justify-center"><DollarSign className="h-5 w-5 text-agro-700" /></div>
              <div className="flex-1"><p className="font-medium text-gray-900">{p.crop_name}</p><p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p></div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full capitalize ${p.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
              <p className="font-bold text-agro-700">₹{p.fare}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
