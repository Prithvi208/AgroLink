import { initDB, run, all, saveDB } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function seedTransporter() {
  await initDB();

  const tid = all("SELECT id FROM users WHERE role='transporter' LIMIT 1")[0]?.id;
  if (!tid) { console.log('No transporter found'); process.exit(1); }
  console.log('Transporter ID:', tid);

  const orders = all('SELECT id FROM orders LIMIT 3');
  const bookings = all('SELECT * FROM transport_bookings WHERE transporter_id = ?', [tid]);
  console.log('Existing transporter bookings:', bookings.length);

  // Clear old transporter bookings
  run('UPDATE transport_bookings SET transporter_id = NULL, status = ? WHERE transporter_id = ?', ['pending', tid]);

  // Create fresh bookings assigned to transporter
  if (orders.length >= 3) {
    const statuses = ['accepted', 'in_transit', 'accepted'];
    orders.forEach((order, i) => {
      const id = uuidv4();
      const trackingId = 'TRK-' + uuidv4().substring(0, 8).toUpperCase();
      run(
        'INSERT INTO transport_bookings (id, order_id, transporter_id, pickup_location, dropoff_location, vehicle_type, status, fare, tracking_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, order.id, tid, `Farm Location ${i + 1}`, `Market ${i + 1}`, 'truck', statuses[i], Math.round((50 + Math.random() * 200) * 100) / 100, trackingId]
      );
      // Add shipment location history for in_transit booking
      if (statuses[i] === 'in_transit') {
        run('INSERT INTO shipments (id, booking_id, current_location, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?)', [uuidv4(), id, 'Near Delhi', 28.6139 + i * 0.01, 77.2090 + i * 0.01, 'in_transit']);
      }
    });
    console.log('Created 3 transporter bookings');
  }

  // Add vehicles if none
  const vehicles = all('SELECT COUNT(*) as c FROM vehicles WHERE transporter_id = ?', [tid]);
  if (vehicles[0]?.c === 0) {
    run('INSERT INTO vehicles (id, transporter_id, make, model, vehicle_type, capacity_tons, license_plate, fuel_type, insurance_expiry, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [uuidv4(), tid, 'Tata', 'Ace', 'truck', 3.5, 'DL-01-AB-1234', 'Diesel', '2027-12-31', 'available']);
    run('INSERT INTO vehicles (id, transporter_id, make, model, vehicle_type, capacity_tons, license_plate, fuel_type, insurance_expiry, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [uuidv4(), tid, 'Mahindra', 'Bolero', 'pickup', 2.0, 'DL-02-CD-5678', 'Diesel', '2027-06-30', 'available']);
    console.log('Added 2 vehicles');
  }

  await saveDB();
  console.log('\n✅ Transporter data seeded!');
  process.exit(0);
}

seedTransporter().catch(err => { console.error(err); process.exit(1); });
