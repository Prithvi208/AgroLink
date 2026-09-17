import { Router } from 'express';
import { all, get } from '../db.js';

const router = Router();

router.get('/prices', (req, res) => {
  try {
    const { crop, market } = req.query;
    let query = 'SELECT * FROM market_prices WHERE 1=1';
    const params = [];
    if (crop) { query += ' AND crop_name = ?'; params.push(crop); }
    if (market) { query += ' AND market = ?'; params.push(market); }
    query += ' ORDER BY recorded_at DESC LIMIT 100';
    const prices = all(query, params);
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/advice', (req, res) => {
  try {
    const { crop } = req.query;
    const advice = generateAdvice(crop || 'general');
    res.json(advice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard', (req, res) => {
  try {
    res.json(getDashboardData());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getDashboardData() {
  const totalFarmers = all("SELECT COUNT(*) as count FROM users WHERE role = 'farmer'");
  const totalBuyers = all("SELECT COUNT(*) as count FROM users WHERE role = 'buyer'");
  const totalTransporters = all("SELECT COUNT(*) as count FROM users WHERE role = 'transporter'");
  const totalCrops = all("SELECT COUNT(*) as count FROM crops WHERE status = 'available'");
  const totalOrders = all('SELECT COUNT(*) as count FROM orders');
  const recentCrops = all(
    `SELECT c.*, u.name as farmer_name FROM crops c JOIN users u ON c.farmer_id = u.id 
     WHERE c.status = 'available' ORDER BY c.created_at DESC LIMIT 5`
  );
  const categories = all(
    "SELECT category, COUNT(*) as count, AVG(price_per_unit) as avg_price FROM crops WHERE status = 'available' GROUP BY category"
  );

  return {
    stats: {
      totalFarmers: totalFarmers[0]?.count || 0,
      totalBuyers: totalBuyers[0]?.count || 0,
      totalTransporters: totalTransporters[0]?.count || 0,
      totalCrops: totalCrops[0]?.count || 0,
      totalOrders: totalOrders[0]?.count || 0
    },
    recentCrops,
    categories
  };
}

function generateAdvice(crop) {
  const cropAdvice = {
    rice: [
      { advice: 'Rice prices may rise 5-8% next month due to monsoon delays. Consider holding stock.', advice_type: 'price', basis: 'Historical seasonal trends and weather patterns' },
      { advice: 'High demand from festival season ahead. Plan harvest to meet peak demand.', advice_type: 'demand', basis: 'Historical demand patterns during festival seasons' },
      { advice: 'Winter rice sowing window approaching. Prepare fields and secure quality seeds.', advice_type: 'seasonal', basis: 'Agricultural calendar and sowing windows' },
      { advice: 'Current prices yield ~22% margin. Consider 28% threshold before bulk selling.', advice_type: 'profit', basis: 'Cost of production vs current market price analysis' }
    ],
    wheat: [
      { advice: 'Wheat prices stabilizing. Current market rate favorable for immediate selling.', advice_type: 'price', basis: 'Current market trend analysis' },
      { advice: 'Export demand increasing. Consider bulk sales to international traders.', advice_type: 'demand', basis: 'Export market trend data' },
      { advice: 'Rabi season wheat sowing begins November. Ensure seed and fertilizer availability.', advice_type: 'seasonal', basis: 'Agricultural calendar and sowing windows' },
      { advice: 'Cost of production vs market price analysis shows ~18% net profit at current rates.', advice_type: 'profit', basis: 'Cost of production vs current market price analysis' }
    ],
    tomato: [
      { advice: 'Tomato prices volatile due to oversupply. Expect 10-15% price drop this week.', advice_type: 'price', basis: 'Current supply-demand dynamics' },
      { advice: 'Urban markets show highest demand. Direct restaurant sales yield 30% more.', advice_type: 'demand', basis: 'Market channel price comparison' },
      { advice: 'Rainy season increases blight risk. Apply preventive fungicide within 48 hours.', advice_type: 'seasonal', basis: 'Weather-based disease risk patterns' },
      { advice: 'Perishable crop alert: Sell within 3 days to avoid spoilage losses of 40%+.', advice_type: 'profit', basis: 'Post-harvest shelf-life data for tomatoes' }
    ],
    cotton: [
      { advice: 'Cotton futures bullish. Good time to enter forward contracts at current rates.', advice_type: 'price', basis: 'Futures market trend analysis' },
      { advice: 'Textile industry demand strong. Premium for long-staple varieties up 12%.', advice_type: 'demand', basis: 'Textile industry demand reports' },
      { advice: 'Cotton picking starts October. Arrange labor and storage in advance.', advice_type: 'seasonal', basis: 'Agricultural calendar and harvest windows' },
      { advice: 'Ginned cotton fetches 35% more than raw. Consider on-farm ginning investment.', advice_type: 'profit', basis: 'Value-added processing margin analysis' }
    ],
    potato: [
      { advice: 'Potato prices seasonal dip. Cold storage potatoes command premium in summer.', advice_type: 'price', basis: 'Seasonal price cycle patterns' },
      { advice: 'Processing industry (chips/fries) demand growing 8% annually.', advice_type: 'demand', basis: 'Food processing industry growth data' },
      { advice: 'Store in cool dry conditions. Proper storage extends shelf life by 3-4 months.', advice_type: 'seasonal', basis: 'Post-harvest storage best practices' },
      { advice: 'A-grade potatoes fetch 2x price. Sorting and grading adds significant value.', advice_type: 'profit', basis: 'Quality grading price premiums' }
    ],
    general: [
      { advice: 'Diversify crop portfolio to reduce market risk. Mix cash crops with food crops.', advice_type: 'general', basis: 'Risk management principles for agriculture' },
      { advice: 'Organic certification commands 20-40% premium. Transition period is 2-3 years.', advice_type: 'general', basis: 'Organic market premium data' },
      { advice: 'Direct buyer connections through platform eliminate 15-25% middlemen costs.', advice_type: 'general', basis: 'Platform transaction cost analysis' },
      { advice: 'Group farming and collective selling increases bargaining power significantly.', advice_type: 'general', basis: 'Cooperative farming economics' }
    ]
  };

  const key = crop.toLowerCase();
  const advice = cropAdvice[key] || cropAdvice.general;
  return advice.map((a, i) => ({ id: i + 1, crop_name: crop, ...a, created_at: new Date().toISOString() }));
}

export default router;
