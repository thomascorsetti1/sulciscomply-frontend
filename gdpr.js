const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all GDPR registers
router.get('/', (req, res) => {
  db.all('SELECT * FROM GDPRRegister', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET GDPR register by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM GDPRRegister WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'GDPR register not found' });
    }
    res.json(row);
  });
});

// GET GDPR registers by client
router.get('/client/:client_id', (req, res) => {
  const { client_id } = req.params;
  db.all('SELECT * FROM GDPRRegister WHERE client_id = ?', [client_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST create GDPR register
router.post('/', (req, res) => {
  const { client_id, data_subject_name, data_category, processing_purpose, gdpr_status } = req.body;
  if (!client_id) {
    return res.status(400).json({ error: 'client_id is required' });
  }
  db.run(
    'INSERT INTO GDPRRegister (client_id, data_subject_name, data_category, processing_purpose, gdpr_status) VALUES (?, ?, ?, ?, ?)',
    [client_id, data_subject_name, data_category, processing_purpose, gdpr_status],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, client_id, data_subject_name, data_category, processing_purpose, gdpr_status });
    }
  );
});

// PUT update GDPR register
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { data_subject_name, data_category, processing_purpose, gdpr_status } = req.body;
  db.run(
    'UPDATE GDPRRegister SET data_subject_name = ?, data_category = ?, processing_purpose = ?, gdpr_status = ? WHERE id = ?',
    [data_subject_name, data_category, processing_purpose, gdpr_status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'GDPR register not found' });
      }
      res.json({ id, data_subject_name, data_category, processing_purpose, gdpr_status });
    }
  );
});

// DELETE GDPR register
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM GDPRRegister WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'GDPR register not found' });
    }
    res.json({ message: 'GDPR register deleted' });
  });
});

module.exports = router;
