import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, run, all } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/:trackingId', (req, res) => {
  try {
    const booking = get(
      `SELECT tb.*, o.total_price, c.name as crop_name 
       FROM transport_bookings tb 
       JOIN orders o ON tb.order_id = o.id 
       JOIN crops c ON o.crop_id = c.id 
       WHERE tb.tracking_id = ?`,
      [req.params.trackingId]
    );
    if (!booking) return res.status(404).json({ error: 'Tracking ID not found' });

    const shipments = all(
      'SELECT * FROM shipments WHERE booking_id = ? ORDER BY updated_at DESC',
      [booking.id]
    );

    res.json({ booking, shipments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:bookingId/location', authenticate, (req, res) => {
  try {
    const { current_location, latitude, longitude, status } = req.body;
    const id = uuidv4();

    run(
      'INSERT INTO shipments (id, booking_id, current_location, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.params.bookingId, current_location, latitude || null, longitude || null, status || 'in_transit']
    );

    if (status) {
      run('UPDATE transport_bookings SET status = ? WHERE id = ?', [status, req.params.bookingId]);
    }

    res.status(201).json({ id, booking_id: req.params.bookingId, current_location, status: status || 'in_transit' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/booking/:bookingId', authenticate, (req, res) => {
  try {
    const shipments = all(
      'SELECT * FROM shipments WHERE booking_id = ? ORDER BY updated_at DESC',
      [req.params.bookingId]
    );
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
