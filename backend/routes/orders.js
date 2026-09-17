import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, run, all } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/my', authenticate, (req, res) => {
  try {
    const orders = all(
      `SELECT o.*, c.name as crop_name, c.category as crop_category, u.name as farmer_name 
       FROM orders o JOIN crops c ON o.crop_id = c.id JOIN users u ON c.farmer_id = u.id 
       WHERE o.buyer_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/farmer-orders', authenticate, authorize('farmer'), (req, res) => {
  try {
    const orders = all(
      `SELECT o.*, c.name as crop_name, u.name as buyer_name, u.phone as buyer_phone 
       FROM orders o JOIN crops c ON o.crop_id = c.id JOIN users u ON o.buyer_id = u.id 
       WHERE c.farmer_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('buyer'), (req, res) => {
  try {
    const { crop_id, quantity, delivery_address } = req.body;
    if (!crop_id || !quantity) return res.status(400).json({ error: 'Crop and quantity are required' });

    const crop = get("SELECT * FROM crops WHERE id = ? AND status = 'available'", [crop_id]);
    if (!crop) return res.status(404).json({ error: 'Crop not available' });
    if (quantity > crop.quantity) return res.status(400).json({ error: 'Insufficient quantity' });

    const total_price = quantity * crop.price_per_unit;
    const id = uuidv4();

    run(
      'INSERT INTO orders (id, buyer_id, crop_id, quantity, total_price, delivery_address) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.user.id, crop_id, quantity, total_price, delivery_address || null]
    );

    run('UPDATE crops SET quantity = quantity - ? WHERE id = ?', [quantity, crop_id]);

    run(`UPDATE crops SET status = 'sold' WHERE id = ? AND quantity <= 0`, [crop_id]);

    const order = get(
      `SELECT o.*, c.name as crop_name FROM orders o JOIN crops c ON o.crop_id = c.id WHERE o.id = ?`,
      [id]
    );

    const farmer = get('SELECT id, name FROM users WHERE id = ?', [crop.farmer_id]);
    if (farmer) {
      run(
        'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), farmer.id, 'New Order Received', `You have a new order for ${crop.name} worth $${total_price}`, 'order', id]
      );
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', authenticate, (req, res) => {
  try {
    const { status } = req.body;
    const order = get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Check authorization: buyer can cancel, farmer can confirm/ship/deliver
    const crop = get('SELECT * FROM crops WHERE id = ?', [order.crop_id]);
    const isBuyer = order.buyer_id === req.user.id;
    const isFarmer = crop && crop.farmer_id === req.user.id;

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': isBuyer ? ['cancelled'] : ['confirmed', 'cancelled'],
      'confirmed': isFarmer ? ['shipped'] : [],
      'shipped': isFarmer ? ['delivered'] : [],
      'delivered': [],
      'cancelled': []
    };

    if (validTransitions[order.status] && !validTransitions[order.status].includes(status)) {
      return res.status(400).json({ error: `Cannot change status from ${order.status} to ${status}` });
    }

    run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json(get('SELECT * FROM orders WHERE id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
