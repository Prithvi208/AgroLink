import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare, MapPin, Phone, Clock, AlertCircle, Package } from 'lucide-react';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPerUnit } from '../utils/netReturn';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700', accepted: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700'
};

export default function Offers() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const isFarmer = user?.role === 'farmer';

  useEffect(() => {
    loadOffers();
  }, [isFarmer]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const endpoint = isFarmer ? '/offers/farmer' : '/offers/buyer';
      const data = await api.get(endpoint);
      setOffers(data);
    } catch (err) {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offer) => {
    if (!confirm(`${t('offers.acceptConfirm')} ${offer.offered_quantity} ${offer.unit} ${offer.crop_name} {formatPerUnit(offer.offered_price_per_unit, offer.unit)}?`)) return;
    
    setActionLoading(offer.id);
    try {
      const result = await api.put(`/offers/${offer.id}/accept`);
      setMessage(`${t('offers.acceptedSuccess')} ${result.remainingQuantity} ${offer.unit} ${t('offers.remainingQuantity')}.`);
      loadOffers();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (offer) => {
    if (!confirm(`${t('offers.rejectConfirm')} ${offer.offered_quantity} ${offer.unit} ${offer.crop_name}?`)) return;
    
    setActionLoading(offer.id);
    try {
      await api.put(`/offers/${offer.id}/reject`);
      setMessage(t('offers.rejectedSuccess'));
      loadOffers();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const [message, setMessage] = useState('');

  if (loading) return (
    <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>
  );

  const subtitle = isFarmer
    ? (t('offers.subtitle') || 'Review and manage offers from buyers for your crops')
    : (t('offers.myOffersSubtitle') || 'Track your sent offers to farmers');

  const emptyMessage = isFarmer
    ? (t('offers.noOffersHint') || 'Buyer offers for your crops will appear here')
    : (t('offers.noMyOffersHint') || 'Your sent offers to farmers will appear here');

  const pendingLabel = isFarmer
    ? (t('offers.pendingOffers') || 'pending offer(s) awaiting your response')
    : (t('offers.myPendingOffers') || 'pending offer(s) awaiting farmer response');

  const partyLabel = isFarmer ? 'Buyer' : 'Farmer';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-agro-600" /> {t('offers.title') || 'Negotiation Offers'}
          </h1>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
        {offers.filter(o => o.status === 'pending').length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-sm font-medium text-yellow-700">
            {offers.filter(o => o.status === 'pending').length} {pendingLabel}
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${message.includes('accepted') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {offers.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('offers.noOffers')}</h3>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map(offer => {
            const partyName = isFarmer ? offer.buyer_name : offer.farmer_name;
            const priceLabel = isFarmer ? 'listedPrice' : 'myOfferedPrice';
            const priceValue = isFarmer ? offer.listed_price : offer.offered_price_per_unit;
            const showActions = isFarmer && offer.status === 'pending';
            const showBuyerInfo = isFarmer;
            const showFarmerInfo = !isFarmer;

            return (
              <div key={offer.id} className={`bg-white rounded-2xl shadow-sm border p-6 ${offer.status === 'pending' ? 'border-yellow-200 bg-yellow-50/50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{offer.crop_name}</h3>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusColors[offer.status] || 'bg-gray-100 text-gray-700'}`}>
                        {t(`offers.${offer.status}`) || offer.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{partyLabel}: <span className="font-medium text-gray-900">{partyName}</span></p>
                  </div>
                  {showActions && (
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => handleAccept(offer)} disabled={actionLoading === offer.id}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition disabled:opacity-50">
                        <CheckCircle className="h-4 w-4" /> {t('offers.accept')}
                      </button>
                      <button onClick={() => handleReject(offer)} disabled={actionLoading === offer.id}
                        className="flex items-center gap-1 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition disabled:opacity-50">
                        <XCircle className="h-4 w-4" /> {t('offers.reject')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MessageSquare className="h-4 w-4 text-agro-600" /> {t('offers.offeredQuantity')}: {offer.offered_quantity} {offer.unit}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4 text-blue-600" /> {t(`offers.${priceLabel}`)}: {formatPerUnit(priceValue, offer.unit)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-earth-600" /> {t('offers.offerPrice')}: {formatPerUnit(offer.offered_price_per_unit, offer.unit)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4 text-purple-600" /> {t('offers.proposedTotal')}: <span className="font-bold text-agro-700">{formatCurrency(offer.proposed_total)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-red-600" /> {t('offers.deliveryAddress')}: {offer.delivery_address}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-500" /> {t('offers.offerDate')}: {new Date(offer.created_at).toLocaleString()}
                  </div>
                </div>

                {showBuyerInfo && offer.buyer_location && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" /> {t('offers.buyerLocation')}: {offer.buyer_location}
                  </div>
                )}

                {showBuyerInfo && offer.buyer_phone && (
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4" /> {offer.buyer_phone}
                  </div>
                )}

                {showFarmerInfo && offer.farmer_location && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" /> {t('offers.farmerLocation')}: {offer.farmer_location}
                  </div>
                )}

                {offer.message && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-700 mb-1">{t('offers.buyerMessage')}:</p>
                    <p className="text-sm text-gray-600 italic">"{offer.message}"</p>
                  </div>
                )}

                {offer.status === 'accepted' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> {isFarmer ? t('offers.acceptedSuccess') : t('offers.myOfferAccepted')}
                    </p>
                  </div>
                )}

                {offer.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> {isFarmer ? t('offers.rejectedSuccess') : t('offers.myOfferRejected')}
                    </p>
                  </div>
                )}

                {isFarmer && offer.status === 'pending' && offer.offered_quantity > offer.listed_price && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Offer price is higher than listed price
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}