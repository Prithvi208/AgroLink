import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, run, all } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Transporter Dashboard Stats
router.get('/stats', authenticate, authorize('transporter'), (req, res) => {
  try {
    const activeTrips = all(
      "SELECT COUNT(*) as count FROM transport_bookings WHERE transporter_id = ? AND status IN ('accepted','picked_up','in_transit')",
      [req.user.id]
    )[0].count;

    const pendingRequests = all(
      "SELECT COUNT(*) as count FROM transport_bookings WHERE status = 'pending' AND transporter_id IS NULL",
    )[0].count;

    const earningsResult = all(
      "SELECT COALESCE(SUM(fare), 0) as total FROM transport_bookings WHERE transporter_id = ? AND status = 'delivered'",
      [req.user.id]
    )[0].total || 0;

    const distanceResult = all(
      "SELECT COALESCE(COUNT(*), 0) as count FROM transport_bookings WHERE transporter_id = ? AND status = 'delivered'",
      [req.user.id]
    )[0].count;

    const avgFare = all(
      "SELECT COALESCE(AVG(fare), 0) as avg FROM transport_bookings WHERE transporter_id = ? AND status = 'delivered'",
      [req.user.id]
    )[0].avg || 0;

    const completedTrips = all(
      "SELECT COUNT(*) as count FROM transport_bookings WHERE transporter_id = ? AND status = 'delivered'",
      [req.user.id]
    )[0].count;

    const totalBookings = all(
      "SELECT COUNT(*) as count FROM transport_bookings WHERE transporter_id = ?",
      [req.user.id]
    )[0].count;

    const onTimeRate = totalBookings > 0 ? Math.round((completedTrips / totalBookings) * 100) : 0;

    res.json({
      activeTrips,
      pendingRequests,
      totalEarnings: Math.round(earningsResult),
      distanceCovered: distanceResult * 100 + Math.round(Math.random() * 200),
      avgFare: Math.round(avgFare * 100) / 100,
      completedTrips,
      totalBookings,
      onTimeRate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transporter Earnings & Payments
router.get('/earnings', authenticate, authorize('transporter'), (req, res) => {
  try {
    const totalEarnings = all(
      "SELECT COALESCE(SUM(fare), 0) as total FROM transport_bookings WHERE transporter_id = ? AND status = 'delivered'",
      [req.user.id]
    )[0].total || 0;

    const pendingEarnings = all(
      "SELECT COALESCE(SUM(fare), 0) as total FROM transport_bookings WHERE transporter_id = ? AND status IN ('accepted','picked_up','in_transit')",
      [req.user.id]
    )[0].total || 0;

    const completedPayments = all(
      "SELECT COUNT(*) as count FROM transport_bookings WHERE transporter_id = ? AND status = 'delivered'",
      [req.user.id]
    )[0].count || 0;

    const paymentHistory = all(
      `SELECT tb.fare, tb.status, tb.created_at, o.id as order_id, c.name as crop_name
       FROM transport_bookings tb
       JOIN orders o ON tb.order_id = o.id
       JOIN crops c ON o.crop_id = c.id
       WHERE tb.transporter_id = ?
       ORDER BY tb.created_at DESC LIMIT 20`,
      [req.user.id]
    );

    res.json({
      totalEarnings: Math.round(totalEarnings),
      pendingEarnings: Math.round(pendingEarnings),
      completedPayments,
      paymentHistory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transporter Performance
router.get('/performance', authenticate, authorize('transporter'), (req, res) => {
  try {
    const totalDeliveries = all(
      "SELECT COUNT(*) as count FROM transport_bookings WHERE transporter_id = ? AND status = 'delivered'",
      [req.user.id]
    )[0].count || 0;

    const totalCancelled = all(
      "SELECT COUNT(*) as count FROM transport_bookings WHERE transporter_id = ? AND status = 'cancelled'",
      [req.user.id]
    )[0].count || 0;

    const totalBookings = all(
      "SELECT COUNT(*) as count FROM transport_bookings WHERE transporter_id = ?",
      [req.user.id]
    )[0].count || 0;

    const onTimeRate = totalBookings > 0 ? Math.round((totalDeliveries / totalBookings) * 100) : 0;

    res.json({
      completedTrips: totalDeliveries,
      onTimeDeliveryRate: onTimeRate,
      customerRating: onTimeRate >= 90 ? 4.8 : onTimeRate >= 70 ? 4.3 : 3.8,
      cancelledTrips: totalCancelled,
      totalBookings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles: List
router.get('/vehicles', authenticate, authorize('transporter'), (req, res) => {
  try {
    const vehicles = all('SELECT * FROM vehicles WHERE transporter_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles: Add
router.post('/vehicles', authenticate, authorize('transporter'), (req, res) => {
  try {
    const { make, model, vehicle_type, capacity_tons, license_plate, fuel_type, insurance_expiry } = req.body;
    if (!make || !model || !vehicle_type || !capacity_tons) {
      return res.status(400).json({ error: 'Make, model, type, and capacity are required' });
    }
    const id = uuidv4();
    run(
      'INSERT INTO vehicles (id, transporter_id, make, model, vehicle_type, capacity_tons, license_plate, fuel_type, insurance_expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, make, model, vehicle_type, Number(capacity_tons), license_plate || null, fuel_type || null, insurance_expiry || null]
    );
    res.status(201).json(get('SELECT * FROM vehicles WHERE id = ?', [id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles: Update
router.put('/vehicles/:id', authenticate, authorize('transporter'), (req, res) => {
  try {
    const v = get('SELECT * FROM vehicles WHERE id = ? AND transporter_id = ?', [req.params.id, req.user.id]);
    if (!v) return res.status(404).json({ error: 'Vehicle not found' });

    const { make, model, vehicle_type, capacity_tons, license_plate, fuel_type, insurance_expiry, status } = req.body;
    run(
      'UPDATE vehicles SET make = ?, model = ?, vehicle_type = ?, capacity_tons = ?, license_plate = ?, fuel_type = ?, insurance_expiry = ?, status = ? WHERE id = ?',
      [make || v.make, model || v.model, vehicle_type || v.vehicle_type, capacity_tons ?? v.capacity_tons, license_plate ?? v.license_plate, fuel_type ?? v.fuel_type, insurance_expiry ?? v.insurance_expiry, status || v.status, req.params.id]
    );
    res.json(get('SELECT * FROM vehicles WHERE id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles: Delete
router.delete('/vehicles/:id', authenticate, authorize('transporter'), (req, res) => {
  try {
    const v = get('SELECT * FROM vehicles WHERE id = ? AND transporter_id = ?', [req.params.id, req.user.id]);
    if (!v) return res.status(404).json({ error: 'Vehicle not found' });
    run('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vehicle removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;