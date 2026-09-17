import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, run, all } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/my', authenticate, (req, res) => {
  try {
    const payments = all(
      `SELECT p.*, o.quantity, c.name as crop_name, u1.name as payer_name, u2.name as payee_name 
       FROM payments p 
       JOIN orders o ON p.order_id = o.id 
       JOIN crops c ON o.crop_id = c.id 
       JOIN users u1 ON p.payer_id = u1.id 
       JOIN users u2 ON p.payee_id = u2.id 
       WHERE p.payer_id = ? OR p.payee_id = ? 
       ORDER BY p.created_at DESC`,
      [req.user.id, req.user.id]
    );
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const { order_id, amount, method } = req.body;
    if (!order_id || !amount) return res.status(400).json({ error: 'Order and amount required' });

    const order = get(
      `SELECT o.*, c.farmer_id FROM orders o JOIN crops c ON o.crop_id = c.id WHERE o.id = ?`,
      [order_id]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Only the buyer can make payments
    if (order.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the buyer can make payments for this order' });
    }

    const id = uuidv4();
    const txnRef = 'TXN-' + uuidv4().substring(0, 8).toUpperCase();

    run(
      'INSERT INTO payments (id, order_id, payer_id, payee_id, amount, method, status, transaction_ref) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, order_id, req.user.id, order.farmer_id, amount, method || 'cash', 'completed', txnRef]
    );

    run("UPDATE orders SET payment_status = 'paid' WHERE id = ?", [order_id]);

    const farmer = get('SELECT id, name FROM users WHERE id = ?', [order.farmer_id]);
    if (farmer) {
      run(
        'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), farmer.id, 'Payment Received', `Payment of $${amount} received for order. Ref: ${txnRef}`, 'order', id]
      );
    }

    res.status(201).json(get('SELECT * FROM payments WHERE id = ?', [id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/order/:orderId', authenticate, (req, res) => {
  try {
    const order = get('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Only buyer or farmer can view payments for this order
    const crop = get('SELECT * FROM crops WHERE id = ?', [order.crop_id]);
    const isBuyer = order.buyer_id === req.user.id;
    const isFarmer = crop && crop.farmer_id === req.user.id;

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({ error: 'Not authorized to view payments for this order' });
    }

    const payments = all(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC',
      [req.params.orderId]
    );
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
