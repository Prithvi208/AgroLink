import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Marketplace from './pages/Marketplace';
import CropDetail from './pages/CropDetail';
import MyCrops from './pages/MyCrops';
import MyOrders from './pages/MyOrders';
import FarmerOrders from './pages/FarmerOrders';
import Transport from './pages/Transport';
import ShipmentTracker from './pages/ShipmentTracker';
import MarketAdvice from './pages/MarketAdvice';
import Carpool from './pages/Carpool';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import PriceAlerts from './pages/PriceAlerts';
import Profile from './pages/Profile';
import SpoilageAlerts from './pages/SpoilageAlerts';
import TransporterDashboard from './pages/TransporterDashboard';
import TransportRequests from './pages/TransportRequests';
import MyTrips from './pages/MyTrips';
import ActiveDelivery from './pages/ActiveDelivery';
import MyVehicles from './pages/MyVehicles';
import Earnings from './pages/Earnings';
import Performance from './pages/Performance';
import Offers from './pages/Offers';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function FarmerHome() {
  const { user } = useAuth();
  return user?.role === 'farmer' ? <FarmerDashboard /> : <Navigate to="/login" />;
}

function BuyerHome() {
  const { user } = useAuth();
  return user?.role === 'buyer' ? <BuyerDashboard /> : <Navigate to="/login" />;
}

function TransporterHome() {
  const { user } = useAuth();
  return user?.role === 'transporter' ? <Navigate to="/transporter/dashboard" replace /> : <Navigate to="/login" />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Sidebar />}
      <div className={user ? 'lg:pl-64' : ''}>
        <ErrorBoundary>
          <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={<ProtectedRoute><FarmerHome /></ProtectedRoute>} />
          <Route path="/buyer" element={<ProtectedRoute><BuyerHome /></ProtectedRoute>} />
          <Route path="/transporter" element={<ProtectedRoute><TransporterHome /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/marketplace/:id" element={<ProtectedRoute><CropDetail /></ProtectedRoute>} />
          <Route path="/my-crops" element={<ProtectedRoute><MyCrops /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/farmer-orders" element={<ProtectedRoute><FarmerOrders /></ProtectedRoute>} />
          <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute><Transport /></ProtectedRoute>} />
          <Route path="/track/:trackingId" element={<ProtectedRoute><ShipmentTracker /></ProtectedRoute>} />
          <Route path="/market-advice" element={<ProtectedRoute><MarketAdvice /></ProtectedRoute>} />
          <Route path="/carpool" element={<ProtectedRoute><Carpool /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/price-alerts" element={<ProtectedRoute><PriceAlerts /></ProtectedRoute>} />
          <Route path="/spoilage-alerts" element={<ProtectedRoute><SpoilageAlerts /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          {/* Transporter routes */}
          <Route path="/transporter/dashboard" element={<ProtectedRoute><TransporterDashboard /></ProtectedRoute>} />
          <Route path="/transporter/requests" element={<ProtectedRoute><TransportRequests /></ProtectedRoute>} />
          <Route path="/transporter/trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/transporter/active" element={<ProtectedRoute><ActiveDelivery /></ProtectedRoute>} />
          <Route path="/transporter/vehicles" element={<ProtectedRoute><MyVehicles /></ProtectedRoute>} />
          <Route path="/transporter/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
          <Route path="/transporter/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
        </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}