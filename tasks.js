const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all tasks
router.get('/', (req, res) => {
  db.all('SELECT * FROM Task', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET task by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM Task WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(row);
  });
});

// GET tasks by client
router.get('/client/:client_id', (req, res) => {
  const { client_id } = req.params;
  db.all('SELECT * FROM Task WHERE client_id = ?', [client_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET tasks by user
router.get('/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.all('SELECT * FROM Task WHERE assigned_to_user_id = ?', [user_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST create task
router.post('/', (req, res) => {
  const { assigned_to_user_id, client_id, description, due_date, status } = req.body;
  if (!assigned_to_user_id || !description) {
    return res.status(400).json({ error: 'assigned_to_user_id and description are required' });
  }
  db.run(
    'INSERT INTO Task (assigned_to_user_id, client_id, description, due_date, status) VALUES (?, ?, ?, ?, ?)',
    [assigned_to_user_id, client_id, description, due_date, status || 'In corso'],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, assigned_to_user_id, client_id, description, due_date, status: status || 'In corso' });
    }
  );
});

// PUT update task
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { description, due_date, status } = req.body;
  db.run(
    'UPDATE Task SET description = ?, due_date = ?, status = ? WHERE id = ?',
    [description, due_date, status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ id, description, due_date, status });
    }
  );
});

// DELETE task
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Task WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  });
});

module.exports = router;
