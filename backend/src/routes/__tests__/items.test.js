const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const itemsRouter = require('../items');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

// Error handler for tests
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

const TEST_DATA_PATH = path.join(__dirname, '../../../../data/items.json');

// Mock data for tests
const mockItems = [
  { "id": 1, "name": "Test Laptop", "category": "Electronics", "price": 1000 },
  { "id": 2, "name": "Test Chair", "category": "Furniture", "price": 500 },
  { "id": 3, "name": "Test Phone", "category": "Electronics", "price": 800 }
];

describe('Items API', () => {
  let originalData;

  beforeAll(async () => {
    // Backup original data
    try {
      const data = await fs.readFile(TEST_DATA_PATH, 'utf8');
      originalData = JSON.parse(data);
    } catch (err) {
      originalData = [];
    }
  });

  beforeEach(async () => {
    // Set up test data
    await fs.writeFile(TEST_DATA_PATH, JSON.stringify(mockItems, null, 2));
  });

  afterAll(async () => {
    // Restore original data
    await fs.writeFile(TEST_DATA_PATH, JSON.stringify(originalData, null, 2));
  });

  describe('GET /api/items', () => {
    it('should return all items with pagination info', async () => {
      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.items).toHaveLength(3);
      expect(response.body.pagination.total).toBe(3);
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/items?q=laptop')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Test Laptop');
    });

    it('should support pagination with limit', async () => {
      const response = await request(app)
        .get('/api/items?limit=2')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should support pagination with page parameter', async () => {
      const response = await request(app)
        .get('/api/items?limit=2&page=2')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.pagination.page).toBe(2);
    });

    it('should search by category', async () => {
      const response = await request(app)
        .get('/api/items?q=electronics')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.items.every(item => item.category === 'Electronics')).toBe(true);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a specific item', async () => {
      const response = await request(app)
        .get('/api/items/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Test Laptop');
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/items/999')
        .expect(404);

      expect(response.body.error).toBe('Item not found');
    });

    it('should handle invalid ID format gracefully', async () => {
      const response = await request(app)
        .get('/api/items/invalid')
        .expect(404);

      expect(response.body.error).toBe('Item not found');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item successfully', async () => {
      const newItem = {
        name: 'New Test Item',
        category: 'Test Category',
        price: 123.45
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      expect(response.body.name).toBe(newItem.name);
      expect(response.body.category).toBe(newItem.category);
      expect(response.body.price).toBe(newItem.price);
      expect(response.body).toHaveProperty('id');
    });

    it('should validate required fields', async () => {
      const invalidItem = {
        name: 'Test Item'
        // missing category and price
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.error).toContain('Invalid payload');
    });

    it('should validate price is a positive number', async () => {
      const invalidItem = {
        name: 'Test Item',
        category: 'Test Category',
        price: -100
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.error).toContain('Invalid payload');
    });

    it('should validate price is a number', async () => {
      const invalidItem = {
        name: 'Test Item',
        category: 'Test Category',
        price: 'not a number'
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.error).toContain('Invalid payload');
    });
  });

  describe('Error handling', () => {
    it('should handle file system errors gracefully', async () => {
      // Temporarily rename the data file to simulate file not found
      const tempPath = TEST_DATA_PATH + '.backup';
      await fs.rename(TEST_DATA_PATH, tempPath);

      try {
        await request(app)
          .get('/api/items')
          .expect(500);
      } finally {
        // Restore the file
        await fs.rename(tempPath, TEST_DATA_PATH);
      }
    });
  });
});
