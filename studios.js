const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all studios
router.get('/', (req, res) => {
  db.all('SELECT * FROM Studio', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET studio by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM Studio WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Studio not found' });
    }
    res.json(row);
  });
});

// POST create studio
router.post('/', (req, res) => {
  const { name, address } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  db.run(
    'INSERT INTO Studio (name, address) VALUES (?, ?)',
    [name, address],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, name, address });
    }
  );
});

// PUT update studio
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;
  db.run(
    'UPDATE Studio SET name = ?, address = ? WHERE id = ?',
    [name, address, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Studio not found' });
      }
      res.json({ id, name, address });
    }
  );
});

// DELETE studio
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Studio WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Studio not found' });
    }
    res.json({ message: 'Studio deleted' });
  });
});

module.exports = router;
