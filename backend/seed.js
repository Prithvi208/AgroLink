import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { initDB, run, get, all, saveDB } from './db.js';

async function seed() {
  await initDB();

  const existingUsers = all('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0]?.count > 0) {
    console.log('Database already seeded. Skipping.');
    process.exit(0);
  }

  console.log('Seeding database...');

  const hashedPass = bcrypt.hashSync('password123', 10);

  const farmerIds = [uuidv4(), uuidv4(), uuidv4()];
  const buyerIds = [uuidv4(), uuidv4()];
  const transporterIds = [uuidv4(), uuidv4()];

  const farmers = [
    { id: farmerIds[0], name: 'Rajesh Kumar', email: 'farmer1@test.com', location: 'Punjab, India', phone: '+91 98765 43210' },
    { id: farmerIds[1], name: 'Priya Sharma', email: 'farmer2@test.com', location: 'Maharashtra, India', phone: '+91 98765 43211' },
    { id: farmerIds[2], name: 'Arjun Patel', email: 'farmer3@test.com', location: 'Gujarat, India', phone: '+91 98765 43212' },
  ];

  const buyers = [
    { id: buyerIds[0], name: 'Fresh Mart Co.', email: 'buyer1@test.com', location: 'Delhi, India', phone: '+91 98765 43220' },
    { id: buyerIds[1], name: 'Green Foods Ltd.', email: 'buyer2@test.com', location: 'Mumbai, India', phone: '+91 98765 43221' },
  ];

  const transporters = [
    { id: transporterIds[0], name: 'Quick Haul Logistics', email: 'transport1@test.com', location: 'Delhi, India', phone: '+91 98765 43230', vehicle_type: 'truck', vehicle_capacity: '10 tons' },
    { id: transporterIds[1], name: 'Rapid Transit', email: 'transport2@test.com', location: 'Mumbai, India', phone: '+91 98765 43231', vehicle_type: 'pickup', vehicle_capacity: '2 tons' },
  ];

  [...farmers, ...buyers, ...transporters].forEach(u => {
    run(
      'INSERT INTO users (id, name, email, password, role, phone, location, vehicle_type, vehicle_capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [u.id, u.name, u.email, hashedPass, u.id.startsWith(farmerIds[0]) || u.id === farmerIds[1] || u.id === farmerIds[2] ? 'farmer' : (u.id.startsWith(buyerIds[0]) || u.id === buyerIds[1] ? 'buyer' : 'transporter'),
       u.phone, u.location, u.vehicle_type || null, u.vehicle_capacity || null]
    );
  });

  console.log('Users seeded');

  const crops = [
    { id: uuidv4(), farmer_id: farmerIds[0], name: 'Basmati Rice', category: 'grains', quantity: 500, unit: 'kg', price_per_unit: 2.50, description: 'Premium quality basmati rice, aged 2 years. Perfect for biryanis and pulao.', location: 'Punjab, India', harvest_date: '2026-08-15' },
    { id: uuidv4(), farmer_id: farmerIds[0], name: 'Wheat Flour', category: 'grains', quantity: 1000, unit: 'kg', price_per_unit: 1.20, description: 'Freshly ground whole wheat flour (atta). Stone-ground for superior taste.', location: 'Punjab, India', harvest_date: '2026-07-20' },
    { id: uuidv4(), farmer_id: farmerIds[1], name: 'Organic Tomatoes', category: 'vegetables', quantity: 200, unit: 'kg', price_per_unit: 0.80, description: 'Fresh organic tomatoes, vine-ripened. No pesticides used.', location: 'Maharashtra, India', harvest_date: '2026-09-01' },
    { id: uuidv4(), farmer_id: farmerIds[1], name: 'Red Onions', category: 'vegetables', quantity: 800, unit: 'kg', price_per_unit: 0.50, description: 'Pungent red onions, freshly harvested. Great for cooking.', location: 'Nashik, India', harvest_date: '2026-08-28' },
    { id: uuidv4(), farmer_id: farmerIds[2], name: 'Cotton Bales', category: 'cotton', quantity: 50, unit: 'ton', price_per_unit: 850, description: 'Premium long-staple cotton bales. Ideal for textile manufacturing.', location: 'Gujarat, India', harvest_date: '2026-06-15' },
    { id: uuidv4(), farmer_id: farmerIds[2], name: 'Raw Sugar', category: 'sugarcane', quantity: 200, unit: 'ton', price_per_unit: 45, description: 'Freshly crushed raw sugar (jaggery). Unrefined and chemical-free.', location: 'Gujarat, India', harvest_date: '2026-08-10' },
    { id: uuidv4(), farmer_id: farmerIds[1], name: 'Alphonso Mangoes', category: 'fruits', quantity: 300, unit: 'kg', price_per_unit: 3.50, description: 'Premium Alphonso mangoes from Ratnagiri. Sweet and aromatic.', location: 'Ratnagiri, India', harvest_date: '2026-05-20' },
    { id: uuidv4(), farmer_id: farmerIds[0], name: 'Turmeric Powder', category: 'spices', quantity: 100, unit: 'kg', price_per_unit: 5.00, description: 'High-curcumin turmeric powder. Freshly ground from whole roots.', location: 'Erode, India', harvest_date: '2026-07-01' },
    { id: uuidv4(), farmer_id: farmerIds[2], name: 'Toor Dal', category: 'pulses', quantity: 400, unit: 'kg', price_per_unit: 1.80, description: 'Premium quality toor dal (pigeon peas). Cleaned and sorted.', location: 'Gujarat, India', harvest_date: '2026-08-05' },
    { id: uuidv4(), farmer_id: farmerIds[0], name: 'Fresh Milk', category: 'dairy', quantity: 200, unit: 'liter', price_per_unit: 0.90, description: 'Farm-fresh cow milk. Pasteurized and hygienically packaged.', location: 'Punjab, India', harvest_date: '2026-09-09' },
  ];

  crops.forEach(c => {
    run(
      `INSERT INTO crops (id, farmer_id, name, category, quantity, unit, price_per_unit, description, location, harvest_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.farmer_id, c.name, c.category, c.quantity, c.unit, c.price_per_unit, c.description, c.location, c.harvest_date]
    );
  });

  console.log('Crops seeded');

  const cropIds = all('SELECT id FROM crops').map(c => c.id);

  const sampleOrders = [
    { id: uuidv4(), buyer_id: buyerIds[0], crop_id: cropIds[0], quantity: 100, total_price: 250, status: 'delivered', payment_status: 'paid', delivery_address: 'Delhi Market Complex' },
    { id: uuidv4(), buyer_id: buyerIds[1], crop_id: cropIds[2], quantity: 50, total_price: 40, status: 'confirmed', payment_status: 'paid', delivery_address: 'Mumbai Central Store' },
    { id: uuidv4(), buyer_id: buyerIds[0], crop_id: cropIds[4], quantity: 10, total_price: 8500, status: 'pending', payment_status: 'unpaid', delivery_address: 'Delhi Textile Hub' },
  ];

  sampleOrders.forEach(o => {
    run(
      'INSERT INTO orders (id, buyer_id, crop_id, quantity, total_price, status, payment_status, delivery_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [o.id, o.buyer_id, o.crop_id, o.quantity, o.total_price, o.status, o.payment_status, o.delivery_address]
    );
  });

  console.log('Orders seeded');

  const sampleTransport = [
    { id: uuidv4(), order_id: sampleOrders[0].id, transporter_id: transporterIds[0], pickup_location: 'Punjab Farm Gate', dropoff_location: 'Delhi Market Complex', vehicle_type: 'truck', status: 'delivered', fare: 120, tracking_id: 'TRK-' + uuidv4().substring(0, 8).toUpperCase() },
    { id: uuidv4(), order_id: sampleOrders[1].id, transporter_id: transporterIds[1], pickup_location: 'Nashik Farm', dropoff_location: 'Mumbai Central Store', vehicle_type: 'pickup', status: 'in_transit', fare: 75, tracking_id: 'TRK-' + uuidv4().substring(0, 8).toUpperCase() },
  ];

  sampleTransport.forEach(t => {
    run(
      `INSERT INTO transport_bookings (id, order_id, transporter_id, pickup_location, dropoff_location, vehicle_type, status, fare, tracking_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.order_id, t.transporter_id, t.pickup_location, t.dropoff_location, t.vehicle_type, t.status, t.fare, t.tracking_id]
    );
  });

  console.log('Transport booked');

  const sampleShipments = [
    { id: uuidv4(), booking_id: sampleTransport[1].id, current_location: 'Nashik Farm', latitude: 20.0059, longitude: 73.7896, status: 'picked_up', updated_at: '2026-09-08T06:00:00' },
    { id: uuidv4(), booking_id: sampleTransport[1].id, current_location: 'Nashik Old Highway', latitude: 19.8075, longitude: 73.3903, status: 'in_transit', updated_at: '2026-09-08T12:00:00' },
    { id: uuidv4(), booking_id: sampleTransport[1].id, current_location: 'Near Mumbai East', latitude: 19.3905, longitude: 73.0209, status: 'in_transit', updated_at: '2026-09-09T08:00:00' },
  ];

  sampleShipments.forEach(s => {
    run(
      'INSERT INTO shipments (id, booking_id, current_location, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?)',
      [s.id, s.booking_id, s.current_location, s.latitude, s.longitude, s.status]
    );
  });

  console.log('Shipment locations seeded');

  run(
    'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), farmerIds[0], 'Welcome to AgroLink!', 'Your account has been set up. Start listing your crops to reach buyers directly.', 'info']
  );
  run(
    'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), buyerIds[0], 'New Crops Available', '5 new crops have been listed in the marketplace. Check them out!', 'info']
  );

  console.log('Notifications seeded');

  const carpoolRides = [
    { id: uuidv4(), driver_id: transporterIds[0], origin: 'Delhi', destination: 'Punjab', departure_time: '2026-09-15T06:00:00', available_seats: 3, price_per_seat: 15, vehicle_info: 'Tata Ace Cargo' },
    { id: uuidv4(), driver_id: farmerIds[0], origin: 'Ludhiana', destination: 'Delhi', departure_time: '2026-09-12T08:00:00', available_seats: 4, price_per_seat: 10, vehicle_info: 'Mahindra Bolero' },
  ];

  carpoolRides.forEach(r => {
    run(
      `INSERT INTO carpool (id, driver_id, origin, destination, departure_time, available_seats, price_per_seat, vehicle_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.driver_id, r.origin, r.destination, r.departure_time, r.available_seats, r.price_per_seat, r.vehicle_info]
    );
  });

  console.log('Carpool rides seeded');

  const marketPrices = [
    { crop_name: 'rice', market: 'Delhi', price: 2.65, trend: 'up' },
    { crop_name: 'rice', market: 'Punjab', price: 2.40, trend: 'stable' },
    { crop_name: 'wheat', market: 'Delhi', price: 1.35, trend: 'stable' },
    { crop_name: 'wheat', market: 'Punjab', price: 1.20, trend: 'up' },
    { crop_name: 'tomato', market: 'Mumbai', price: 0.65, trend: 'down' },
    { crop_name: 'tomato', market: 'Pune', price: 0.70, trend: 'down' },
    { crop_name: 'cotton', market: 'Ahmedabad', price: 890, trend: 'up' },
    { crop_name: 'cotton', market: 'Jaipur', price: 870, trend: 'up' },
    { crop_name: 'potato', market: 'Delhi', price: 0.90, trend: 'stable' },
    { crop_name: 'potato', market: 'Agra', price: 0.85, trend: 'down' },
    { crop_name: 'onion', market: 'Nashik', price: 0.60, trend: 'up' },
    { crop_name: 'onion', market: 'Delhi', price: 0.65, trend: 'up' },
  ];

  marketPrices.forEach(p => {
    run(
      'INSERT INTO market_prices (crop_name, market, price, unit, trend) VALUES (?, ?, ?, ?, ?)',
      [p.crop_name, p.market, p.price, 'kg', p.trend]
    );
  });

  console.log('Market prices seeded');

  run(
    'INSERT INTO price_alerts (id, user_id, crop_name, threshold_price, condition, alert_on) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), farmerIds[0], 'rice', 2.50, 'above', 'crop_price']
  );

  console.log('Sample price alerts seeded');

  console.log('\n✅ Database seeded successfully!');
  console.log('\nTest accounts:');
  console.log('  Farmer:    farmer1@test.com / password123');
  console.log('  Farmer:    farmer2@test.com / password123');
  console.log('  Buyer:     buyer1@test.com  / password123');
  console.log('  Transporter: transport1@test.com / password123');

  saveDB();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
