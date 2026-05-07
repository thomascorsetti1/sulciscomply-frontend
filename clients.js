const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all clients
router.get('/', (req, res) => {
  db.all('SELECT * FROM Client', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET client by ID with AML, GDPR, and Tasks
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM Client WHERE id = ?', [id], (err, client) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Get AML files
    db.all('SELECT * FROM AMLFile WHERE client_id = ?', [id], (err, aml) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get GDPR registers
      db.all('SELECT * FROM GDPRRegister WHERE client_id = ?', [id], (err, gdpr) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Get Tasks
        db.all('SELECT * FROM Task WHERE client_id = ?', [id], (err, tasks) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            client,
            aml,
            gdpr,
            tasks
          });
        });
      });
    });
  });
});

// GET clients by studio
router.get('/studio/:studio_id', (req, res) => {
  const { studio_id } = req.params;
  db.all('SELECT * FROM Client WHERE studio_id = ?', [studio_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST create client
router.post('/', (req, res) => {
  const { studio_id, name, address, tax_id, fiscal_context } = req.body;
  if (!studio_id || !name) {
    return res.status(400).json({ error: 'studio_id and name are required' });
  }
  db.run(
    'INSERT INTO Client (studio_id, name, address, tax_id, fiscal_context) VALUES (?, ?, ?, ?, ?)',
    [studio_id, name, address, tax_id, fiscal_context],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, studio_id, name, address, tax_id, fiscal_context });
    }
  );
});

// PUT update client
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, address, tax_id, fiscal_context } = req.body;
  db.run(
    'UPDATE Client SET name = ?, address = ?, tax_id = ?, fiscal_context = ? WHERE id = ?',
    [name, address, tax_id, fiscal_context, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json({ id, name, address, tax_id, fiscal_context });
    }
  );
});

// DELETE client
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Client WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted' });
  });
});

module.exports = router;
