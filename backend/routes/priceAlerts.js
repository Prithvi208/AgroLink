import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, run, all } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, (req, res) => {
  try {
    const alerts = all(
      'SELECT * FROM price_alerts WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const { crop_name, threshold_price, condition, alert_on } = req.body;
    if (!crop_name || !threshold_price || !condition) {
      return res.status(400).json({ error: 'Crop, threshold price, and condition are required' });
    }
    if (!['above', 'below'].includes(condition)) {
      return res.status(400).json({ error: 'Condition must be above or below' });
    }
    const id = uuidv4();
    run(
      'INSERT INTO price_alerts (id, user_id, crop_name, threshold_price, condition, alert_on) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.user.id, crop_name, Number(threshold_price), condition, alert_on || 'crop_price']
    );
    res.status(201).json(get('SELECT * FROM price_alerts WHERE id = ?', [id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, (req, res) => {
  try {
    const alert = get('SELECT * FROM price_alerts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    const { threshold_price, condition, active } = req.body;
    run(
      'UPDATE price_alerts SET threshold_price = ?, condition = ?, active = ? WHERE id = ?',
      [threshold_price ?? alert.threshold_price, condition || alert.condition, active ?? alert.active, req.params.id]
    );
    res.json(get('SELECT * FROM price_alerts WHERE id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const alert = get('SELECT * FROM price_alerts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    run('DELETE FROM price_alerts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/check', authenticate, (req, res) => {
  try {
    const alerts = all('SELECT * FROM price_alerts WHERE user_id = ? AND active = 1', [req.user.id]);
    const triggered = [];
    const now = new Date().toISOString();

    for (const alert of alerts) {
      if (alert.alert_on === 'market_price') {
        const marketPrice = get(
          'SELECT price FROM market_prices WHERE crop_name LIKE ? ORDER BY recorded_at DESC LIMIT 1',
          [alert.crop_name]
        );
        if (!marketPrice) continue;

        const price = marketPrice.price;
        const hit = alert.condition === 'above' ? price >= alert.threshold_price : price <= alert.threshold_price;

        if (hit) {
          const notifId = uuidv4();
          run(
            'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
            [notifId, req.user.id, 'Price Alert Triggered',
             `${alert.crop_name.charAt(0).toUpperCase() + alert.crop_name.slice(1)} is now $${price}/kg (${alert.condition} your $${alert.threshold_price} threshold)`,
             'alert', null]
          );
          run('UPDATE price_alerts SET last_triggered = ?, active = 0 WHERE id = ?', [now, alert.id]);
          triggered.push({ ...alert, matched_price: price });
        }
      } else {
        const crop = get(
          'SELECT id, name, price_per_unit FROM crops WHERE farmer_id = ? AND name LIKE ? AND status = ? ORDER BY created_at DESC LIMIT 1',
          [req.user.id, `%${alert.crop_name}%`, 'available']
        );
        if (!crop) continue;

        const price = crop.price_per_unit;
        const hit = alert.condition === 'above' ? price >= alert.threshold_price : price <= alert.threshold_price;

        if (hit) {
          const notifId = uuidv4();
          run(
            'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
            [notifId, req.user.id, 'Crop Price Alert',
             `Your ${crop.name} is now listed at $${price} which is ${alert.condition} your $${alert.threshold_price} target`,
             'alert', crop.id]
          );
          run('UPDATE price_alerts SET last_triggered = ?, active = 0 WHERE id = ?', [now, alert.id]);
          triggered.push({ ...alert, matched_price: price });
        }
      }
    }

    res.json({ triggered, checked: alerts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;