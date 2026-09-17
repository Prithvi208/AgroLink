import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'agrolink.db');

let db = null;

export async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('farmer','buyer','transporter')),
      phone TEXT,
      location TEXT,
      vehicle_type TEXT,
      vehicle_capacity TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS crops (
      id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg',
      price_per_unit REAL NOT NULL,
      description TEXT,
      image_url TEXT,
      location TEXT,
      harvest_date TEXT,
      status TEXT DEFAULT 'available' CHECK(status IN ('available','sold','reserved','expired')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      buyer_id TEXT NOT NULL,
      crop_id TEXT NOT NULL,
      quantity REAL NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','shipped','delivered','cancelled')),
      payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid','paid','refunded')),
      delivery_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (crop_id) REFERENCES crops(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transport_bookings (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      transporter_id TEXT,
      pickup_location TEXT NOT NULL,
      dropoff_location TEXT NOT NULL,
      vehicle_type TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','ready_for_pickup','picked_up','in_transit','delivered','cancelled')),
      fare REAL,
      tracking_id TEXT,
      estimated_delivery TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (transporter_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      current_location TEXT,
      latitude REAL,
      longitude REAL,
      status TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES transport_bookings(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      payer_id TEXT NOT NULL,
      payee_id TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT DEFAULT 'cash',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','completed','failed','refunded')),
      transaction_ref TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (payer_id) REFERENCES users(id),
      FOREIGN KEY (payee_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info' CHECK(type IN ('info','order','transport','alert','spoilage','carpool')),
      read INTEGER DEFAULT 0,
      related_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS spoilage_alerts (
      id TEXT PRIMARY KEY,
      crop_id TEXT NOT NULL,
      farmer_id TEXT NOT NULL,
      severity TEXT NOT NULL CHECK(severity IN ('low','medium','high','critical')),
      message TEXT NOT NULL,
      suggested_action TEXT,
      discount_suggested REAL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','resolved','expired')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crop_id) REFERENCES crops(id),
      FOREIGN KEY (farmer_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS market_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT NOT NULL,
      market TEXT NOT NULL,
      price REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg',
      trend TEXT CHECK(trend IN ('up','down','stable')),
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS market_advice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT NOT NULL,
      advice TEXT NOT NULL,
      advice_type TEXT CHECK(advice_type IN ('price','demand','seasonal','profit','general')),
      confidence REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS price_alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      crop_name TEXT NOT NULL,
      threshold_price REAL NOT NULL,
      condition TEXT NOT NULL CHECK(condition IN ('above','below')),
      alert_on TEXT NOT NULL CHECK(alert_on IN ('crop_price','market_price')),
      active INTEGER DEFAULT 1,
      last_triggered DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      transporter_id TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      vehicle_type TEXT CHECK(vehicle_type IN ('truck','pickup','van','trailer','tempo')),
      capacity_tons REAL NOT NULL,
      license_plate TEXT,
      status TEXT DEFAULT 'available' CHECK(status IN ('available','active','maintenance','retired')),
      fuel_type TEXT,
      insurance_expiry TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transporter_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS carpool (
      id TEXT PRIMARY KEY,
      driver_id TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      departure_time DATETIME NOT NULL,
      available_seats INTEGER NOT NULL,
      price_per_seat REAL NOT NULL,
      vehicle_info TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','full','cancelled','completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS carpool_bookings (
      id TEXT PRIMARY KEY,
      carpool_id TEXT NOT NULL,
      passenger_id TEXT NOT NULL,
      seats_booked INTEGER NOT NULL DEFAULT 1,
      status TEXT DEFAULT 'booked' CHECK(status IN ('booked','cancelled','completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (carpool_id) REFERENCES carpool(id),
      FOREIGN KEY (passenger_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      crop_id TEXT NOT NULL,
      farmer_id TEXT NOT NULL,
      buyer_id TEXT NOT NULL,
      offered_quantity REAL NOT NULL,
      offered_price_per_unit REAL NOT NULL,
      proposed_total REAL NOT NULL,
      delivery_address TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crop_id) REFERENCES crops(id),
      FOREIGN KEY (farmer_id) REFERENCES users(id),
      FOREIGN KEY (buyer_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      content TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )
  `);

  saveDB();
  console.log('Database initialized');
  return db;
}

export function getDB() {
  return db;
}

export function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

export function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

export function all(sql, params = []) {
  const results = [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}
