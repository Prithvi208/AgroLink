import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, run, all } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { origin, destination, date } = req.query;
    let query = `SELECT cp.*, u.name as driver_name, u.phone as driver_phone 
                 FROM carpool cp JOIN users u ON cp.driver_id = u.id WHERE cp.status = 'active'`;
    const params = [];
    if (origin) { query += ' AND cp.origin LIKE ?'; params.push(`%${origin}%`); }
    if (destination) { query += ' AND cp.destination LIKE ?'; params.push(`%${destination}%`); }
    if (date) { query += " AND DATE(cp.departure_time) = ?"; params.push(date); }
    query += ' AND cp.available_seats > 0 ORDER BY cp.departure_time ASC';
    const rides = all(query, params);
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authenticate, (req, res) => {
  try {
    const asDriver = all(
      `SELECT cp.*, u.name as driver_name FROM carpool cp JOIN users u ON cp.driver_id = u.id 
       WHERE cp.driver_id = ? ORDER BY cp.departure_time DESC`,
      [req.user.id]
    );

    const asPassenger = all(
      `SELECT cp.*, cb.seats_booked, cb.status as booking_status, u.name as driver_name 
       FROM carpool_bookings cb JOIN carpool cp ON cb.carpool_id = cp.id JOIN users u ON cp.driver_id = u.id 
       WHERE cb.passenger_id = ? ORDER BY cp.departure_time DESC`,
      [req.user.id]
    );

    res.json({ asDriver, asPassenger });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const { origin, destination, departure_time, available_seats, price_per_seat, vehicle_info } = req.body;
    if (!origin || !destination || !departure_time || !available_seats || !price_per_seat) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const id = uuidv4();
    run(
      `INSERT INTO carpool (id, driver_id, origin, destination, departure_time, available_seats, price_per_seat, vehicle_info) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, origin, destination, departure_time, available_seats, price_per_seat, vehicle_info || null]
    );

    res.status(201).json(get('SELECT * FROM carpool WHERE id = ?', [id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/book', authenticate, (req, res) => {
  try {
    const { seats } = req.body || { seats: 1 };
    const ride = get("SELECT * FROM carpool WHERE id = ? AND status = 'active'", [req.params.id]);
    if (!ride) return res.status(404).json({ error: 'Ride not found or not available' });
    if (ride.driver_id === req.user.id) return res.status(400).json({ error: "Can't book your own ride" });
    if (seats > ride.available_seats) return res.status(400).json({ error: 'Not enough seats' });

    const id = uuidv4();
    run(
      'INSERT INTO carpool_bookings (id, carpool_id, passenger_id, seats_booked) VALUES (?, ?, ?, ?)',
      [id, req.params.id, req.user.id, seats]
    );

    run('UPDATE carpool SET available_seats = available_seats - ? WHERE id = ?', [seats, req.params.id]);
    run("UPDATE carpool SET status = 'full' WHERE id = ? AND available_seats <= 0", [req.params.id]);

    const driver = get('SELECT id, name FROM users WHERE id = ?', [ride.driver_id]);
    if (driver) {
      run(
        'INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), driver.id, 'Ride Booked', `A passenger booked ${seats} seat(s) on your ${ride.origin} → ${ride.destination} ride.`, 'carpool', req.params.id]
      );
    }

    res.status(201).json({ id, carpool_id: req.params.id, seats_booked: seats, total_cost: seats * ride.price_per_seat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const ride = get('SELECT * FROM carpool WHERE id = ? AND driver_id = ?', [req.params.id, req.user.id]);
    if (!ride) return res.status(404).json({ error: 'Ride not found or not yours' });
    run("UPDATE carpool SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Ride cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
