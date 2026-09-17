import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, run, all } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, authorize('buyer'), (req, res) => {
  try {
    const { crop_id, offered_quantity, offered_price_per_unit, delivery_address, message } = req.body;

    if (!crop_id || !offered_quantity || !offered_price_per_unit || !delivery_address) {
      return res.status(400).json({ error: 'Crop, quantity, price, and delivery address are required' });
    }

    if (offered_quantity <= 0) {
      return res.status(400).json({ error: 'Offer quantity must be greater than 0' });
    }

    if (offered_price_per_unit <= 0) {
      return res.status(400).json({ error: 'Offered price must be greater than 0' });
    }

    const crop = get("SELECT * FROM crops WHERE id = ? AND status = 'available'", [crop_id]);
    if (!crop) return res.status(404).json({ error: 'Crop not available' });

    if (offered_quantity > crop.quantity) {
      return res.status(400).json({ error: `Insufficient quantity. Only ${crop.quantity} ${crop.unit} available` });
    }

    const proposed_total = offered_quantity * offered_price_per_unit;
    const id = uuidv4();

    run(
      `INSERT INTO offers (id, crop_id, farmer_id, buyer_id, offered_quantity, offered_price_per_unit, proposed_total, delivery_address, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, crop_id, crop.farmer_id, req.user.id, offered_quantity, offered_price_per_unit, proposed_total, delivery_address, message || null]
    );

    const farmer = get('SELECT id, name FROM users WHERE id = ?', [crop.farmer_id]);
    if (farmer) {
      run(
        'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), farmer.id, 'New Offer Received', `New offer from ${req.user.name} for ${offered_quantity} ${crop.unit} of ${crop.name} at $${offered_price_per_unit}/${crop.unit}`, 'order', id]
      );
    }

    const offer = get(
      `SELECT o.*, c.name as crop_name, c.unit, u.name as buyer_name
       FROM offers o
       JOIN crops c ON o.crop_id = c.id
       JOIN users u ON o.buyer_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    res.status(201).json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/farmer', authenticate, authorize('farmer'), (req, res) => {
  try {
    const offers = all(
      `SELECT o.*, c.name as crop_name, c.unit, c.price_per_unit as listed_price, u.name as buyer_name, u.location as buyer_location, u.phone as buyer_phone
       FROM offers o
       JOIN crops c ON o.crop_id = c.id
       JOIN users u ON o.buyer_id = u.id
       WHERE o.farmer_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/buyer', authenticate, authorize('buyer'), (req, res) => {
  try {
    const offers = all(
      `SELECT o.*, c.name as crop_name, c.unit, u.name as farmer_name
       FROM offers o
       JOIN crops c ON o.crop_id = c.id
       JOIN users u ON c.farmer_id = u.id
       WHERE o.buyer_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/accept', authenticate, authorize('farmer'), (req, res) => {
  try {
    const offer = get('SELECT * FROM offers WHERE id = ? AND farmer_id = ?', [req.params.id, req.user.id]);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    if (offer.status !== 'pending') {
      return res.status(400).json({ error: `Offer is already ${offer.status}` });
    }

    // Get the crop first to check current quantity
    const cropBefore = get('SELECT * FROM crops WHERE id = ?', [offer.crop_id]);
    if (!cropBefore) return res.status(404).json({ error: 'Crop not found' });

    if (offer.offered_quantity > cropBefore.quantity) {
      return res.status(400).json({ error: `Cannot accept. Only ${cropBefore.quantity} ${cropBefore.unit} available (offered: ${offer.offered_quantity} ${cropBefore.unit})` });
    }

    // Atomic update: use a single UPDATE with WHERE clause to prevent race conditions
    // The WHERE clause ensures we only update if sufficient quantity exists
    run(
      `UPDATE crops SET 
        quantity = quantity - ?, 
        status = CASE WHEN quantity - ? <= 0 THEN 'sold' ELSE 'available' END 
      WHERE id = ? AND quantity >= ?`,
      [offer.offered_quantity, offer.offered_quantity, offer.crop_id, offer.offered_quantity]
    );

    // Verify the update succeeded by checking the crop quantity
    const cropAfter = get('SELECT * FROM crops WHERE id = ?', [offer.crop_id]);
    if (!cropAfter) return res.status(404).json({ error: 'Crop not found after update' });

    // Verify the quantity was actually decremented
    const expectedQuantity = cropBefore.quantity - offer.offered_quantity;
    if (cropAfter.quantity !== expectedQuantity) {
      // The update didn't happen (likely due to race condition - another request got there first)
      // Rollback the offer status (it's still pending)
      return res.status(409).json({ error: 'Unable to accept offer due to concurrent modification. Please try again.' });
    }

    const newQuantity = cropAfter.quantity;
    const newStatus = newQuantity <= 0 ? 'sold' : 'available';

    run("UPDATE offers SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);

    const orderId = uuidv4();
    run(
      'INSERT INTO orders (id, buyer_id, crop_id, quantity, total_price, delivery_address) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, offer.buyer_id, offer.crop_id, offer.offered_quantity, offer.proposed_total, offer.delivery_address]
    );

    const buyer = get('SELECT id, name FROM users WHERE id = ?', [offer.buyer_id]);
    if (buyer) {
      run(
        'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), buyer.id, 'Offer Accepted', `Your offer for ${offer.offered_quantity} ${cropBefore.unit} of ${cropBefore.name} at $${offer.offered_price_per_unit}/${cropBefore.unit} has been accepted`, 'order', orderId]
      );
    }

    const acceptedOffer = get(
      `SELECT o.*, c.name as crop_name, c.unit
       FROM offers o
       JOIN crops c ON o.crop_id = c.id
       WHERE o.id = ?`,
      [req.params.id]
    );

    res.json({ offer: acceptedOffer, orderId, remainingQuantity: newQuantity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/reject', authenticate, authorize('farmer'), (req, res) => {
  try {
    const offer = get('SELECT * FROM offers WHERE id = ? AND farmer_id = ?', [req.params.id, req.user.id]);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    if (offer.status !== 'pending') {
      return res.status(400).json({ error: `Offer is already ${offer.status}` });
    }

    run("UPDATE offers SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);

    const crop = get('SELECT * FROM crops WHERE id = ?', [offer.crop_id]);

    const buyer = get('SELECT id, name FROM users WHERE id = ?', [offer.buyer_id]);
    if (buyer && crop) {
      run(
        'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), buyer.id, 'Offer Rejected', `Your offer for ${offer.offered_quantity} ${crop.unit} of ${crop.name} at $${offer.offered_price_per_unit}/${crop.unit} was rejected`, 'order', req.params.id]
      );
    }

    const rejectedOffer = get(
      `SELECT o.*, c.name as crop_name, c.unit
       FROM offers o
       JOIN crops c ON o.crop_id = c.id
       WHERE o.id = ?`,
      [req.params.id]
    );

    res.json({ offer: rejectedOffer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;