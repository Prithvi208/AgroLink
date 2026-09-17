import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Lightbulb, Target, Leaf, DollarSign, AlertTriangle, Info } from 'lucide-react';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const cropSuggestions = ['rice', 'wheat', 'tomato', 'cotton', 'potato', 'general'];
const typeIcons = { price: TrendingUp, demand: Target, seasonal: Leaf, profit: DollarSign, general: Lightbulb };
const typeColors = { price: 'bg-blue-100 text-blue-700', demand: 'bg-purple-100 text-purple-700', seasonal: 'bg-green-100 text-green-700', profit: 'bg-earth-100 text-earth-700', general: 'bg-gray-100 text-gray-700' };

export default function MarketAdvice() {
  const { t } = useLanguage();
  const [crop, setCrop] = useState('rice');
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/market/advice?crop=${crop}`)
      .then(setAdvice)
      .catch(() => setAdvice([]))
      .finally(() => setLoading(false));
  }, [crop]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Lightbulb className="h-8 w-8 text-agro-600" /> {t('marketAdvice.title') || 'Market Advisor'}
        </h1>
        <p className="text-gray-600 mt-1">{t('marketAdvice.subtitle') || 'Rule-based market recommendations for your crops'}</p>
        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
          <Info className="h-4 w-4" />
          <span>Recommendations are rule-based, based on historical market patterns, seasonal trends, and cost analysis — not AI/ML predictions.</span>
        </p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
        {cropSuggestions.map(c => (
          <button key={c} onClick={() => setCrop(c)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${crop === c ? 'bg-agro-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {advice.map(a => {
            const Icon = typeIcons[a.advice_type] || Lightbulb;
            return (
              <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${typeColors[a.advice_type] || 'bg-gray-100 text-gray-700'}`}>
                    <Icon className="inline h-3 w-3 mr-1" />{a.advice_type}
                  </span>
                  <span className="text-xs text-gray-500">Rule-based</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{a.advice}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-agro-700 capitalize">{a.crop_name}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>{a.basis || 'Based on historical patterns'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
