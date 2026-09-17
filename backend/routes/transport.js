import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, run, all } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/available', authenticate, authorize('transporter'), (req, res) => {
  try {
    const bookings = all(
      `SELECT tb.*, o.total_price as order_value, c.name as crop_name, u.name as buyer_name, o.delivery_address 
       FROM transport_bookings tb 
       JOIN orders o ON tb.order_id = o.id 
       JOIN crops c ON o.crop_id = c.id 
       JOIN users u ON o.buyer_id = u.id 
       WHERE tb.status = 'pending' AND tb.transporter_id IS NULL 
       ORDER BY tb.created_at DESC`
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authenticate, (req, res) => {
  try {
    const bookings = all(
      `SELECT tb.*, o.total_price as order_value, c.name as crop_name 
       FROM transport_bookings tb 
       JOIN orders o ON tb.order_id = o.id 
       JOIN crops c ON o.crop_id = c.id 
       WHERE tb.transporter_id = ? ORDER BY tb.created_at DESC`,
      [req.user.id]
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const { order_id, pickup_location, dropoff_location, vehicle_type } = req.body;
    if (!order_id || !pickup_location || !dropoff_location) {
      return res.status(400).json({ error: 'Order, pickup, and dropoff locations are required' });
    }

    const order = get('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Verify the user is the buyer of the order
    if (order.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the buyer can arrange transport for their order' });
    }

    const existing = get('SELECT id FROM transport_bookings WHERE order_id = ?', [order_id]);
    if (existing) return res.status(400).json({ error: 'Transport already booked for this order' });

    const id = uuidv4();
    const tracking_id = 'TRK-' + uuidv4().substring(0, 8).toUpperCase();
    const fare = Math.round((50 + Math.random() * 200) * 100) / 100;

    run(
      `INSERT INTO transport_bookings (id, order_id, pickup_location, dropoff_location, vehicle_type, fare, tracking_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, order_id, pickup_location, dropoff_location, vehicle_type || 'truck', fare, tracking_id]
    );

    run("UPDATE orders SET status = 'confirmed' WHERE id = ?", [order_id]);

    const buyer = get('SELECT id, name FROM users WHERE id = ?', [order.buyer_id]);
    if (buyer) {
      run(
        'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), buyer.id, 'Transport Booked', `Transport arranged for your order. Tracking ID: ${tracking_id}`, 'transport', id]
      );
    }

    const booking = get('SELECT * FROM transport_bookings WHERE id = ?', [id]);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/accept', authenticate, authorize('transporter'), (req, res) => {
  try {
    const booking = get('SELECT * FROM transport_bookings WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Can only accept pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Can only accept pending bookings' });
    }

    run('UPDATE transport_bookings SET transporter_id = ?, status = ? WHERE id = ?', [req.user.id, 'accepted', req.params.id]);

    const order = get('SELECT * FROM orders WHERE id = ?', [booking.order_id]);
    if (order) {
      run(
        'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), order.buyer_id, 'Transport Accepted', `Transporter assigned. Waiting for pickup. Tracking: ${booking.tracking_id}`, 'transport', req.params.id]
      );
      
      // Also notify farmer
      const crop = get('SELECT * FROM crops WHERE id = ?', [order.crop_id]);
      if (crop) {
        run(
          'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), crop.farmer_id, 'Transport Accepted', `Transporter assigned for your ${crop.name}. Waiting for pickup.`, 'transport', req.params.id]
        );
      }
    }

    res.json(get('SELECT * FROM transport_bookings WHERE id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/ready', authenticate, authorize('transporter'), (req, res) => {
  try {
    const booking = get('SELECT * FROM transport_bookings WHERE id = ? AND transporter_id = ?', [req.params.id, req.user.id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found or not assigned to you' });

    if (booking.status !== 'accepted') {
      return res.status(400).json({ error: `Cannot mark as ready for pickup. Current status: ${booking.status}` });
    }

    run("UPDATE transport_bookings SET status = 'ready_for_pickup' WHERE id = ?", [req.params.id]);

    const order = get('SELECT * FROM orders WHERE id = ?', [booking.order_id]);
    if (order) {
      run(
        'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), order.buyer_id, 'Ready for Pickup', `Transporter is ready to pick up your shipment. Tracking: ${booking.tracking_id}`, 'transport', req.params.id]
      );
      
      // Also notify farmer
      const crop = get('SELECT * FROM crops WHERE id = ?', [order.crop_id]);
      if (crop) {
        run(
          'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), crop.farmer_id, 'Ready for Pickup', `Transporter is ready to pick up your ${crop.name}.`, 'transport', req.params.id]
        );
      }
    }

    res.json(get('SELECT * FROM transport_bookings WHERE id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/decline', authenticate, authorize('transporter'), (req, res) => {
  try {
    const booking = get('SELECT * FROM transport_bookings WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.transporter_id !== req.user.id) return res.status(403).json({ error: 'Not your booking' });

    // Can only decline if status is 'accepted' (not yet picked up)
    if (booking.status !== 'accepted') {
      return res.status(400).json({ error: 'Can only decline bookings with accepted status' });
    }

    run('UPDATE transport_bookings SET status = ?, transporter_id = NULL WHERE id = ?', ['pending', req.params.id]);

    const order = get('SELECT * FROM orders WHERE id = ?', [booking.order_id]);
    if (order) {
      run(
        'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), order.buyer_id, 'Request Declined', `A transporter declined your delivery request. You can reassign.`, 'transport', req.params.id]
      );
    }

    res.json(get('SELECT * FROM transport_bookings WHERE id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', authenticate, authorize('transporter'), (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = get('SELECT * FROM transport_bookings WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Verify the transporter owns this booking
    if (booking.transporter_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }

    // Validate status transitions
    const validTransitions = {
      'accepted': ['ready_for_pickup', 'cancelled'],
      'ready_for_pickup': ['picked_up', 'cancelled'],
      'picked_up': ['in_transit', 'cancelled'],
      'in_transit': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };

    if (booking.status && validTransitions[booking.status] && !validTransitions[booking.status].includes(status)) {
      return res.status(400).json({ error: `Cannot change status from ${booking.status} to ${status}` });
    }

    run('UPDATE transport_bookings SET status = ? WHERE id = ?', [status, req.params.id]);

    if (status === 'delivered') {
      const bookingUpdated = get('SELECT * FROM transport_bookings WHERE id = ?', [req.params.id]);
      if (bookingUpdated) {
        run("UPDATE orders SET status = 'delivered' WHERE id = ?", [bookingUpdated.order_id]);
        const order = get('SELECT * FROM orders WHERE id = ?', [bookingUpdated.order_id]);
        if (order) {
          run(
            'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
            [uuidv4(), order.buyer_id, 'Order Delivered', 'Your order has been delivered successfully!', 'order', bookingUpdated.order_id]
          );
        }
      }
    }

    res.json(get('SELECT * FROM transport_bookings WHERE id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
