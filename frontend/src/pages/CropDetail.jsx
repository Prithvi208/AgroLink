import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Calendar, Package, ShoppingCart, ArrowLeft, Truck, CheckCircle, Hand, MessageSquare, X, Calculator, Info, ArrowUpRight, ArrowDownRight, Wheat, Carrot, Apple, Flame, Milk, Bean, Sprout, TreePine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';
import { calculateNetReturn, formatCurrency, formatPerUnit } from '../utils/netReturn';

const categoryIcons = {
  grains: React.createElement(Wheat, {className: "text-4xl"}),
  vegetables: React.createElement(Carrot, {className: "text-4xl text-green-600"}),
  fruits: React.createElement(Apple, {className: "text-4xl text-red-500"}),
  spices: React.createElement(Flame, {className: "text-4xl text-orange-500"}),
  dairy: React.createElement(Milk, {className: "text-4xl text-blue-500"}),
  pulses: React.createElement(Bean, {className: "text-4xl text-amber-600"}),
  cotton: React.createElement(Sprout, {className: "text-4xl text-green-600"}),
  sugarcane: React.createElement(TreePine, {className: "text-4xl text-green-700"}),
  default: React.createElement(Package, {className: "text-4xl"})
};

export default function CropDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [booking, setBooking] = useState(false);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [transporting, setTransporting] = useState(false);
  const [step, setStep] = useState('view');
  const [message, setMessage] = useState('');
  
  // Offer state
  const [offerQuantity, setOfferQuantity] = useState(1);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerAddress, setOfferAddress] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [sendingOffer, setSendingOffer] = useState(false);

  // Net Return Calculator - estimates transport cost based on distance and quantity
  const calculateEstimatedTransport = (quantityKg, pickup, dropoff) => {
    const baseRatePerKmPerTon = 3;
    const estimatedDistanceKm = 500;
    const quantityTons = quantityKg / 1000;
    return Math.round(baseRatePerKmPerTon * estimatedDistanceKm * quantityTons);
  };

  // Compute net returns for buy and offer
  const netReturnBuy = crop ? calculateNetReturn({
    sellingPricePerKg: crop.price_per_unit,
    quantityKg: quantity,
    transportCostPerKg: 0,
    transportCostTotal: calculateEstimatedTransport(quantity, crop.location, address),
    platformFeePercent: 2
  }) : null;

  const netReturnOffer = (crop && offerPrice) ? calculateNetReturn({
    sellingPricePerKg: Number(offerPrice) || 0,
    quantityKg: offerQuantity,
    transportCostPerKg: 0,
    transportCostTotal: calculateEstimatedTransport(offerQuantity, crop.location, offerAddress),
    platformFeePercent: 2
  }) : null;

  useEffect(() => {
    api.get(`/crops/${id}`)
      .then(setCrop)
      .catch(() => setMessage('Crop not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (user?.role !== 'buyer') return;
    setBooking(true);
    try {
      const order = await api.post('/orders', { crop_id: crop.id, quantity, delivery_address: address });
      setMessage('Order placed successfully!');
      // Navigate to transport page with order ID for seamless transport booking
      navigate(`/transport?orderId=${order.id}`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBooking(false);
    }
  };

  const handleOffer = async () => {
    if (user?.role !== 'buyer') return;
    setSendingOffer(true);
    setMessage('');
    try {
      if (!offerQuantity || offerQuantity <= 0) {
        setMessage('Offer quantity must be greater than 0');
        return;
      }
      if (offerQuantity > crop.quantity) {
        setMessage(`Offer quantity cannot exceed available quantity (${crop.quantity} ${crop.unit})`);
        return;
      }
      if (!offerPrice || offerPrice <= 0) {
        setMessage('Offered price must be greater than 0');
        return;
      }
      if (!offerAddress.trim()) {
        setMessage('Delivery address is required');
        return;
      }

      await api.post('/offers', {
        crop_id: crop.id,
        offered_quantity: offerQuantity,
        offered_price_per_unit: Number(offerPrice),
        delivery_address: offerAddress,
        message: offerMessage
      });
      setMessage('Offer sent successfully to the farmer.');
      setStep('offerSent');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSendingOffer(false);
    }
  };

  const handleTransport = async () => {
    setTransporting(true);
    try {
      const latestOrder = await api.get('/orders/my');
      const order = latestOrder[0];
      const booking = await api.post('/transport', { order_id: order.id, pickup_location: pickup, dropoff_location: dropoff, vehicle_type: 'truck' });
      setMessage(`Transport booked! Tracking ID: ${booking.tracking_id}`);
      setStep('done');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTransporting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div>
    </div>
  );

  if (!crop) return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
      <p className="text-gray-500 text-lg">{message || 'Crop not found'}</p>
      <button onClick={() => navigate('/marketplace')} className="mt-4 text-agro-600 hover:underline">Back to Marketplace</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/marketplace')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5" /> {t('common.viewAll') || 'Back to Marketplace'}
      </button>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${message.includes('success') || message.includes('Tracking') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-agro-50 to-agro-100 rounded-2xl h-80 flex items-center justify-center">
          <span className="text-9xl">{categoryIcons[crop.category?.toLowerCase()] || '🌱'}</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-agro-100 text-agro-700 text-sm font-medium px-3 py-1 rounded-lg capitalize">{crop.category}</span>
            <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-lg">{crop.status}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{crop.name}</h1>
          {crop.description && <p className="text-gray-600 mb-6">{crop.description}</p>}

          <div className="bg-white border rounded-2xl p-6 mb-6">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-agro-700">{formatPerUnit(crop.price_per_unit, crop.unit)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="h-4 w-4" /> {crop.quantity} {crop.unit} available
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" /> {crop.location || 'India'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" /> Harvested: {crop.harvest_date || 'N/A'}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Farmer Info</h3>
            <p className="font-medium text-gray-900">{crop.farmer_name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <MapPin className="h-4 w-4" /> {crop.farmer_location || 'India'}
            </div>
            {crop.farmer_phone && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Phone className="h-4 w-4" /> {crop.farmer_phone}
              </div>
            )}
          </div>

          {user?.role === 'buyer' && (
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">{t('offers.buyNow') || 'Buy Options'}</h3>
              
              {step === 'view' && (
                <div className="flex gap-3 mb-6">
                  <button onClick={() => setStep('buy')} 
                    className={`flex-1 py-3 rounded-xl font-semibold transition ${step === 'buy' ? 'bg-agro-600 text-white' : 'bg-agro-100 text-agro-700 border border-agro-200'}`}>
                    <ShoppingCart className="h-5 w-5 inline mr-2" /> {t('offers.buyNow')}
                  </button>
                  <button onClick={() => { setOfferQuantity(1); setOfferPrice(''); setOfferAddress(''); setOfferMessage(''); setStep('offer'); }} 
                    className={`flex-1 py-3 rounded-xl font-semibold transition ${step === 'offer' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                    <Hand className="h-5 w-5 inline mr-2" /> {t('offers.makeOffer')}
                  </button>
                </div>
              )}

              {step === 'buy' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity ({crop.unit})</label>
                    <input type="number" min="1" max={crop.quantity} value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('marketplace.filterLocation') || 'Delivery Address'}</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="Enter delivery address..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none" />
                  </div>
                  
                  {/* Net Return Calculator for Buy */}
                  {netReturnBuy && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-gray-900">{t('offers.netReturnCalculator') || 'Net Return Calculator'}</span>
                        <Info className="h-4 w-4 text-gray-400 ml-auto" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-gray-500">{t('offers.sellingPrice') || 'Selling Price'}</p>
                          <p className="font-bold text-gray-900">{formatPerKg(crop.price_per_unit)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-gray-500">{t('offers.estTransportCost') || 'Est. Transport'}</p>
                          <p className="font-bold text-orange-600">{formatCurrency(netReturnBuy.transportCostTotal)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-gray-500">{t('offers.platformFee') || 'Platform Fee (2%)'}</p>
                          <p className="font-bold text-gray-600">{formatCurrency(netReturnBuy.platformFee)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-gray-500">{t('offers.grossValue') || 'Gross Value'}</p>
                          <p className="font-bold text-gray-900">{formatCurrency(netReturnBuy.grossSaleValue)}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowDownRight className="h-5 w-5 text-red-500" />
                          <span className="font-semibold text-gray-700">{t('offers.totalCosts') || 'Total Costs'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{formatCurrency(netReturnBuy.totalCosts)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="h-5 w-5 text-green-500" />
                          <span className="font-semibold text-gray-700">{t('offers.netReturn') || 'Net Return'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-2xl ${netReturnBuy.isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(netReturnBuy.netReturn)}
                          </span>
                          <span className="text-sm text-gray-500">({formatPerKg(netReturnBuy.netReturnPerKg)})</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>Transport cost estimated at ₹3/km/ton for ~500km. Platform fee 2%. Actual costs may vary.</span>
                      </p>
                    </div>
                  )}
                  <div className="bg-agro-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-agro-700">{formatCurrency(quantity * crop.price_per_unit)}</p>
                  </div>
                  <button onClick={handleBuy} disabled={booking}
                    className="w-full bg-agro-600 text-white py-3 rounded-xl font-semibold hover:bg-agro-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    <ShoppingCart className="h-5 w-5" /> {booking ? 'Placing Order...' : t('offers.buyNow')}
                  </button>
                  <button onClick={() => setStep('view')} className="w-full py-3 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                    {t('common.cancel')}
                  </button>
                </div>
              )}

              {step === 'offer' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-blue-700 mb-3">
                      <MessageSquare className="h-4 w-4" />
                      <span>{t('offers.optionalMessage') || 'Negotiate quantity and price with the farmer'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">{t('offers.listedPrice')}</p>
                        <p className="font-bold text-gray-900">{formatPerUnit(crop.price_per_unit, crop.unit)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('marketplace.available')}</p>
                        <p className="font-bold text-gray-900">{crop.quantity} {crop.unit}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('offers.offerQuantity')} ({crop.unit})</label>
                    <input type="number" min="1" max={crop.quantity} value={offerQuantity} onChange={e => setOfferQuantity(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('offers.offerPricePerUnit')} {crop.unit}</label>
                    <input type="number" min="0.01" step="0.01" value={offerPrice} onChange={e => setOfferPrice(e.target.value)}
                      placeholder={crop.price_per_unit}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                  </div>
                  
{/* Net Return Calculator for Offer */}
                  {netReturnOffer && (
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Calculator className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">{t('offers.netReturnCalculator') || 'Net Return Calculator'}</span>
                          <Info className="h-4 w-4 text-gray-400 ml-auto" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-gray-500">{t('offers.offerPrice') || 'Offer Price'}</p>
                            <p className="font-bold text-gray-900">{formatPerKg(Number(offerPrice))}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-gray-500">{t('offers.estTransportCost') || 'Est. Transport'}</p>
                            <p className="font-bold text-orange-600">{formatCurrency(netReturnOffer.transportCostTotal)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-gray-500">{t('offers.platformFee') || 'Platform Fee (2%)'}</p>
                            <p className="font-bold text-gray-600">{formatCurrency(netReturnOffer.platformFee)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-gray-500">{t('offers.grossValue') || 'Gross Value'}</p>
                            <p className="font-bold text-gray-900">{formatCurrency(netReturnOffer.grossSaleValue)}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ArrowDownRight className="h-5 w-5 text-red-500" />
                            <span className="font-semibold text-gray-700">{t('offers.totalCosts') || 'Total Costs'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{formatCurrency(netReturnOffer.totalCosts)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="h-5 w-5 text-green-500" />
                            <span className="font-semibold text-gray-700">{t('offers.netReturn') || 'Net Return'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-2xl ${netReturnOffer.isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(netReturnOffer.netReturn)}
                            </span>
                            <span className="text-sm text-gray-500">({formatPerKg(netReturnOffer.netReturnPerKg)})</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          <span>Transport cost estimated at ₹3/km/ton for ~500km. Platform fee 2%. Actual costs may vary.</span>
                        </p>
                      </div>
                    )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('offers.proposedTotalLabel')}</label>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(offerQuantity && offerPrice ? (offerQuantity * offerPrice) : 0)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('offers.deliveryAddress')}</label>
                    <input type="text" value={offerAddress} onChange={e => setOfferAddress(e.target.value)}
                      placeholder="Enter delivery address..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('offers.optionalMessage')}</label>
                    <textarea value={offerMessage} onChange={e => setOfferMessage(e.target.value)}
                      rows={3} placeholder="Add a note for the farmer..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setStep('view'); setMessage(''); }} 
                      className="flex-1 py-3 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                      <X className="h-5 w-5 inline mr-2" /> {t('common.cancel')}
                    </button>
                    <button onClick={handleOffer} disabled={sendingOffer}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                      <Hand className="h-5 w-5" /> {sendingOffer ? t('offers.sending') : t('offers.sendOffer')}
                    </button>
                  </div>
                </div>
              )}

              {step === 'offerSent' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">{t('offers.accepted') || 'Offer Sent!'}</h3>
                  <p className="text-green-700 mb-4">{t('offers.offerSent')}</p>
                  <button onClick={() => { setStep('view'); setMessage(''); }} className="bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 transition">
                    {t('common.viewAll') || 'Back to Options'}
                  </button>
                </div>
              )}
            </div>
          )}

          {user?.role === 'buyer' && step === 'transport' && (
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-agro-600" /> Arrange Transport
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                  <input type="text" value={pickup} onChange={e => setPickup(e.target.value)}
                    placeholder={crop.location || 'Farmer location'} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drop-off Location</label>
                  <input type="text" value={dropoff} onChange={e => setDropoff(e.target.value)}
                    placeholder={address || 'Your delivery address'} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none" />
                </div>
                <button onClick={handleTransport} disabled={transporting}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                  <Truck className="h-5 w-5" /> {transporting ? 'Booking...' : 'Book Transport'}
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 mb-2">Order Complete!</h3>
              <p className="text-green-700 mb-4">Your order has been placed and transport arranged.</p>
              <button onClick={() => navigate('/my-orders')} className="bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 transition">
                View My Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
