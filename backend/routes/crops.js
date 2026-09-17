import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, run, all } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { search, category, location, min_price, max_price } = req.query;
    let query = `SELECT c.*, u.name as farmer_name, u.location as farmer_location 
                 FROM crops c JOIN users u ON c.farmer_id = u.id WHERE c.status = 'available'`;
    const params = [];

    if (search) { query += ` AND (c.name LIKE ? OR c.description LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    if (category) { query += ` AND c.category = ?`; params.push(category); }
    if (location) { query += ` AND c.location LIKE ?`; params.push(`%${location}%`); }
    if (min_price) { query += ` AND c.price_per_unit >= ?`; params.push(Number(min_price)); }
    if (max_price) { query += ` AND c.price_per_unit <= ?`; params.push(Number(max_price)); }

    query += ' ORDER BY c.created_at DESC';
    const crops = all(query, params);
    res.json(crops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authenticate, (req, res) => {
  try {
    const crops = all('SELECT * FROM crops WHERE farmer_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(crops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const crop = get(
      `SELECT c.*, u.name as farmer_name, u.location as farmer_location, u.phone as farmer_phone 
       FROM crops c JOIN users u ON c.farmer_id = u.id WHERE c.id = ?`,
      [req.params.id]
    );
    if (!crop) return res.status(404).json({ error: 'Crop not found' });
    res.json(crop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('farmer'), (req, res) => {
  try {
    const { name, category, quantity, unit, price_per_unit, description, image_url, location, harvest_date } = req.body;
    if (!name || !category || !quantity || !price_per_unit) {
      return res.status(400).json({ error: 'Name, category, quantity, and price are required' });
    }
    const id = uuidv4();
    run(
      `INSERT INTO crops (id, farmer_id, name, category, quantity, unit, price_per_unit, description, image_url, location, harvest_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, name, category, quantity, unit || 'kg', price_per_unit, description || null, image_url || null, location || null, harvest_date || null]
    );

    const crop = get('SELECT * FROM crops WHERE id = ?', [id]);
    res.status(201).json(crop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, authorize('farmer'), (req, res) => {
  try {
    const crop = get('SELECT * FROM crops WHERE id = ? AND farmer_id = ?', [req.params.id, req.user.id]);
    if (!crop) return res.status(404).json({ error: 'Crop not found or not yours' });

    const { name, category, quantity, unit, price_per_unit, description, image_url, location, harvest_date, status } = req.body;
    run(
      `UPDATE crops SET name = ?, category = ?, quantity = ?, unit = ?, price_per_unit = ?, description = ?, 
       image_url = ?, location = ?, harvest_date = ?, status = ? WHERE id = ?`,
      [name || crop.name, category || crop.category, quantity ?? crop.quantity,
       unit || crop.unit, price_per_unit ?? crop.price_per_unit, description ?? crop.description,
       image_url ?? crop.image_url, location ?? crop.location, harvest_date ?? crop.harvest_date,
       status || crop.status, req.params.id]
    );

    res.json(get('SELECT * FROM crops WHERE id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('farmer'), (req, res) => {
  try {
    const crop = get('SELECT * FROM crops WHERE id = ? AND farmer_id = ?', [req.params.id, req.user.id]);
    if (!crop) return res.status(404).json({ error: 'Crop not found or not yours' });
    run('DELETE FROM crops WHERE id = ?', [req.params.id]);
    res.json({ message: 'Crop deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
