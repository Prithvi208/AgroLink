import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, CheckCircle, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [method, setMethod] = useState('cash');

  useEffect(() => {
    Promise.all([
      api.get('/payments/my').catch(() => []),
      (user?.role === 'buyer' ? api.get('/orders/my').catch(() => []) : Promise.resolve([])),
    ]).then(([p, o]) => {
      setPayments(p);
      setOrders(o.filter(ord => ord.payment_status === 'unpaid'));
      setLoading(false);
    });
  }, [user]);

  const handlePay = async (orderId, amount) => {
    setPaying(orderId);
    try {
      await api.post('/payments', { order_id: orderId, amount, method });
      const updated = await api.get('/payments/my');
      setPayments(updated);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      alert(err.message);
    } finally {
      setPaying(null);
    }
  };

  const totalPaid = payments.filter(p => p.status === 'completed' && p.payer_id === user?.id).reduce((s, p) => s + p.amount, 0);
  const totalReceived = payments.filter(p => p.status === 'completed' && p.payee_id === user?.id).reduce((s, p) => s + p.amount, 0);

  const renderPendingPayments = () => {
    if (user?.role !== 'buyer' || orders.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Payments</h2>
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{order.crop_name}</p>
                  <p className="text-sm text-gray-600">Amount: <span className="font-bold text-agro-700">{order.total_price}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <select value={method} onChange={e => setMethod(e.target.value)}
                    className="px-3 py-2 border rounded-xl text-sm outline-none">
                    <option value="cash">Cash (Demo)</option><option value="upi">UPI (Demo)</option><option value="bank_transfer">Bank Transfer (Demo)</option>
                  </select>
                  <button onClick={() => handlePay(order.id, order.total_price)} disabled={paying === order.id}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition flex items-center gap-1 disabled:opacity-50">
                    <CreditCard className="h-4 w-4" /> {paying === order.id ? 'Processing...' : 'Pay Now (Demo)'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTransactionHistory = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-agro-500 border-t-transparent"></div>
        </div>
      );
    }
    if (payments.length === 0) {
      return (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No transactions yet</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {payments.map(p => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm border p-5 flex items-center gap-4">
            <div className={p.payer_id === user?.id ? 'bg-red-100' : 'bg-green-100'} style={{width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <ArrowRight className={p.payer_id === user?.id ? 'h-5 w-5 text-red-600 rotate-180' : 'h-5 w-5 text-green-600'} />
            </div>
            <div style={{flex: 1}}>
              <p className="font-medium text-gray-900">{p.crop_name}</p>
              <p className="text-sm text-gray-500">
                {p.payer_id === user?.id ? `Paid to ${p.payee_name}` : `Received from ${p.payer_name}`} · {p.method} (Demo) · Ref: {p.transaction_ref}
              </p>
            </div>
            <div style={{textAlign: 'right'}}>
              <p style={{fontWeight: 'bold', color: p.payer_id === user?.id ? '#dc2626' : '#16a34a'}}>
                {p.payer_id === user?.id ? '-' : '+'}${p.amount}
              </p>
              <p style={{fontSize: '0.75rem', color: '#9ca3af'}}>{new Date(p.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-agro-600" /> Payments
        </h1>
        <p className="text-gray-600 mb-2">Track all your transactions</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
          <p className="text-sm text-amber-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Demo Payment System: This is a mock payment ledger. No real money is transferred. Payments are recorded for demo purposes only.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{totalPaid.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <p className="text-sm text-gray-500">Total Received</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{totalReceived.toFixed(2)}</p>
          </div>
        </div>

        {renderPendingPayments()}

        <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h2>
        {renderTransactionHistory()}
      </div>
    </div>
  );
}