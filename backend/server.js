import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import cropRoutes from './routes/crops.js';
import orderRoutes from './routes/orders.js';
import transportRoutes from './routes/transport.js';
import shipmentRoutes from './routes/shipments.js';
import marketRoutes from './routes/market.js';
import carpoolRoutes from './routes/carpool.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import paymentRoutes from './routes/payments.js';
import priceAlertRoutes from './routes/priceAlerts.js';
import transporterRoutes from './routes/transporter.js';
import offerRoutes from './routes/offers.js';
import spoilageRoutes from './routes/spoilage.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/carpool', carpoolRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/price-alerts', priceAlertRoutes);
app.use('/api/transporter', transporterRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/spoilage', spoilageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AgroLink API is running' });
});

async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`AgroLink server running on port ${PORT}`);
  });
}

start();
