const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (non-blocking async version)
async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

// Utility to write data (non-blocking async version)
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, q, page = 1 } = req.query;
    let results = data;

    // Server-side search functionality
    if (q) {
      const searchTerm = q.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination support
    const pageSize = limit ? parseInt(limit) : 10;
    const pageNumber = parseInt(page);
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedResults = results.slice(startIndex, endIndex);
    
    res.json({
      items: paginatedResults,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: results.length,
        totalPages: Math.ceil(results.length / pageSize)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // Validate payload
    const { name, category, price } = req.body;
    
    if (!name || !category || typeof price !== 'number' || price <= 0) {
      const err = new Error('Invalid payload. Required: name, category, and positive price');
      err.status = 400;
      throw err;
    }

    const item = { name, category, price };
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;