const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all users
router.get('/', (req, res) => {
  db.all('SELECT * FROM User', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM User WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(row);
  });
});

// GET users by studio
router.get('/studio/:studio_id', (req, res) => {
  const { studio_id } = req.params;
  db.all('SELECT * FROM User WHERE studio_id = ?', [studio_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST create user
router.post('/', (req, res) => {
  const { studio_id, username, email, role } = req.body;
  if (!studio_id || !username || !role) {
    return res.status(400).json({ error: 'studio_id, username, and role are required' });
  }
  db.run(
    'INSERT INTO User (studio_id, username, email, role) VALUES (?, ?, ?, ?)',
    [studio_id, username, email, role],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, studio_id, username, email, role });
    }
  );
});

// PUT update user
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;
  db.run(
    'UPDATE User SET username = ?, email = ?, role = ? WHERE id = ?',
    [username, email, role, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ id, username, email, role });
    }
  );
});

// DELETE user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM User WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  });
});

module.exports = router;
