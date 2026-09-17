import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { get, run } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agrolink_secret_key_2024';

router.post('/register', (req, res) => {
  try {
    const { name, email, password, role, phone, location, vehicle_type, vehicle_capacity } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }
    if (!['farmer', 'buyer', 'transporter'].includes(role)) {
      return res.status(400).json({ error: 'Role must be farmer, buyer, or transporter' });
    }
    const existing = get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = uuidv4();
    run(
      'INSERT INTO users (id, name, email, password, role, phone, location, vehicle_type, vehicle_capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, role, phone || null, location || null, vehicle_type || null, vehicle_capacity || null]
    );

    const token = jwt.sign({ id, email, role, name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, email, role, phone, location } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, location: user.location } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticate, (req, res) => {
  const user = get('SELECT id, name, email, role, phone, location, vehicle_type, vehicle_capacity FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

export default router;
