import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, run, all } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Crop shelf life estimates (in days after harvest)
const SHELF_LIFE = {
  tomato: 7,
  potato: 60,
  onion: 90,
  rice: 365,
  wheat: 365,
  cotton: 365,
  potato: 60,
  mango: 14,
  banana: 7,
  grapes: 14,
  apple: 30,
  orange: 21,
  carrot: 30,
  cabbage: 60,
  cauliflower: 14,
  spinach: 7,
  lettuce: 10,
  general: 30
};

function getShelfLife(cropName, category) {
  const name = cropName.toLowerCase();
  // Check specific crop names first
  for (const [crop, days] of Object.entries(SHELF_LIFE)) {
    if (name.includes(crop)) return days;
  }
  // Fallback to category
  const categoryShelfLife = {
    vegetables: 14,
    fruits: 14,
    grains: 180,
    pulses: 180,
    spices: 365,
    dairy: 7,
    cotton: 180,
    sugarcane: 30
  };
  return categoryShelfLife[category?.toLowerCase()] || SHELF_LIFE.general;
}

function calculateDaysSinceHarvest(harvestDate) {
  if (!harvestDate) return 0;
  const harvest = new Date(harvestDate);
  const today = new Date();
  const diffTime = today - harvest;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Get spoilage alerts for farmer
router.get('/farmer', authenticate, authorize('farmer'), (req, res) => {
  try {
    const alerts = all(
      `SELECT sa.*, c.name as crop_name, c.quantity, c.unit, c.harvest_date
       FROM spoilage_alerts sa
       JOIN crops c ON sa.crop_id = c.id
       WHERE sa.farmer_id = ?
       ORDER BY sa.created_at DESC`,
      [req.user.id]
    );
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check and create spoilage alerts for farmer's crops
router.post('/check', authenticate, authorize('farmer'), (req, res) => {
  try {
    const crops = all(
      `SELECT * FROM crops WHERE farmer_id = ? AND status = 'available'`,
      [req.user.id]
    );

    const newAlerts = [];
    const today = new Date().toISOString().split('T')[0];

    for (const crop of crops) {
      const shelfLife = getShelfLife(crop.name, crop.category);
      const daysSinceHarvest = crop.harvest_date ? calculateDaysSinceHarvest(crop.harvest_date) : 0;
      const daysRemaining = shelfLife - daysSinceHarvest;

      // Check if alert already exists for this crop
      const existingAlert = get(
        'SELECT * FROM spoilage_alerts WHERE crop_id = ? AND status = ?',
        [crop.id, 'active']
      );

      let severity = null;
      let message = null;
      let suggestedAction = null;
      let discountSuggested = 0;

      if (daysRemaining <= 0) {
        severity = 'critical';
        message = `Your ${crop.name} (${crop.quantity} ${crop.unit}) harvested ${daysSinceHarvest} days ago has exceeded its estimated shelf life of ${shelfLife} days.`;
        suggestedAction = 'Sell immediately at discounted price or donate to avoid total loss.';
        discountSuggested = 30;
      } else if (daysRemaining <= 2) {
        severity = 'high';
        message = `Your ${crop.name} (${crop.quantity} ${crop.unit}) has only ${daysRemaining} day(s) left before exceeding shelf life.`;
        suggestedAction = 'Prioritize selling this crop. Consider offering a 15-20% discount to accelerate sales.';
        discountSuggested = 20;
      } else if (daysRemaining <= 5) {
        severity = 'medium';
        message = `Your ${crop.name} (${crop.quantity} ${crop.unit}) has ${daysRemaining} days remaining before spoilage risk increases.`;
        suggestedAction = 'Plan sales for this crop within the next few days. Consider promotional pricing.';
        discountSuggested = 10;
      } else if (daysRemaining <= 10) {
        severity = 'low';
        message = `Your ${crop.name} (${crop.quantity} ${crop.unit}) has ${daysRemaining} days before reaching spoilage risk threshold.`;
        suggestedAction = 'Monitor this crop closely. Plan your sales strategy accordingly.';
        discountSuggested = 5;
      }

      if (severity) {
        if (existingAlert) {
          // Update existing alert
          run(
            `UPDATE spoilage_alerts SET severity = ?, message = ?, suggested_action = ?, discount_suggested = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [severity, message, suggestedAction, discountSuggested, existingAlert.id]
          );
          newAlerts.push({ ...existingAlert, severity, message, suggested_action: suggestedAction, discount_suggested: discountSuggested });
        } else {
          // Create new alert
          const alertId = uuidv4();
          run(
            `INSERT INTO spoilage_alerts (id, crop_id, farmer_id, severity, message, suggested_action, discount_suggested, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
            [alertId, crop.id, req.user.id, severity, message, suggestedAction, discountSuggested]
          );
          newAlerts.push({ id: alertId, crop_id: crop.id, severity, message, suggested_action: suggestedAction, discount_suggested: discountSuggested, status: 'active' });
        }
      } else if (existingAlert) {
        // No longer at risk, resolve the alert
        run("UPDATE spoilage_alerts SET status = 'resolved' WHERE id = ?", [existingAlert.id]);
      }
    }

    res.json({ alerts: newAlerts, checked: crops.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve spoilage alert
router.put('/:id/resolve', authenticate, authorize('farmer'), (req, res) => {
  try {
    const alert = get('SELECT * FROM spoilage_alerts WHERE id = ? AND farmer_id = ?', [req.params.id, req.user.id]);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    run("UPDATE spoilage_alerts SET status = 'resolved' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Alert resolved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;