const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

// Cache for stats with timestamp
let statsCache = {
  data: null,
  timestamp: null,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

// Watch for file changes to invalidate cache
let fileWatcher = null;

function setupFileWatcher() {
  if (fileWatcher) return;
  
  fileWatcher = fs.watch(DATA_PATH, (eventType) => {
    if (eventType === 'change') {
      console.log('Items file changed, invalidating stats cache');
      statsCache.data = null;
      statsCache.timestamp = null;
    }
  });
}

// Calculate stats from items data
function calculateStats(items) {
  const total = items.length;
  const averagePrice = total > 0 ? items.reduce((acc, cur) => acc + cur.price, 0) / total : 0;
  
  // Additional useful stats
  const maxPrice = total > 0 ? Math.max(...items.map(item => item.price)) : 0;
  const minPrice = total > 0 ? Math.min(...items.map(item => item.price)) : 0;
  const categories = [...new Set(items.map(item => item.category))];
  
  return {
    total,
    averagePrice: Math.round(averagePrice * 100) / 100, // Round to 2 decimal places
    maxPrice,
    minPrice,
    categories: categories.length,
    categoryBreakdown: categories.reduce((acc, category) => {
      acc[category] = items.filter(item => item.category === category).length;
      return acc;
    }, {})
  };
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    setupFileWatcher();
    
    const now = Date.now();
    
    // Check if cache is valid
    if (statsCache.data && 
        statsCache.timestamp && 
        (now - statsCache.timestamp) < statsCache.CACHE_DURATION) {
      console.log('Serving stats from cache');
      return res.json(statsCache.data);
    }
    
    // Calculate fresh stats
    console.log('Calculating fresh stats');
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(raw);
    const stats = calculateStats(items);
    
    // Update cache
    statsCache.data = stats;
    statsCache.timestamp = now;
    
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Cleanup on process exit
process.on('exit', () => {
  if (fileWatcher) {
    fileWatcher.close();
  }
});

module.exports = router;