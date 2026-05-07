const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all AML files
router.get('/', (req, res) => {
  db.all('SELECT * FROM AMLFile', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET AML file by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM AMLFile WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'AML file not found' });
    }
    res.json(row);
  });
});

// GET AML files by client
router.get('/client/:client_id', (req, res) => {
  const { client_id } = req.params;
  db.all('SELECT * FROM AMLFile WHERE client_id = ?', [client_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST create AML file
router.post('/', (req, res) => {
  const { client_id, status, risk_rating } = req.body;
  if (!client_id || !status) {
    return res.status(400).json({ error: 'client_id and status are required' });
  }
  db.run(
    'INSERT INTO AMLFile (client_id, status, risk_rating) VALUES (?, ?, ?)',
    [client_id, status, risk_rating],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, client_id, status, risk_rating, last_updated: new Date() });
    }
  );
});

// PUT update AML file
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, risk_rating } = req.body;
  db.run(
    'UPDATE AMLFile SET status = ?, risk_rating = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
    [status, risk_rating, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'AML file not found' });
      }
      res.json({ id, status, risk_rating, last_updated: new Date() });
    }
  );
});

// DELETE AML file
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM AMLFile WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'AML file not found' });
    }
    res.json({ message: 'AML file deleted' });
  });
});

module.exports = router;
