const db = require('./db');

// Seed data
const seedData = () => {
  db.serialize(() => {
    // Insert Studios
    db.run(
      "INSERT OR IGNORE INTO Studio (id, name, address) VALUES (1, 'Studio Legale Rossi', 'Via Roma 1, Milano')"
    );
    db.run(
      "INSERT OR IGNORE INTO Studio (id, name, address) VALUES (2, 'Commercialisti Associati', 'Corso Garibaldi 50, Roma')"
    );

    // Insert Users
    db.run(
      "INSERT OR IGNORE INTO User (id, studio_id, username, email, role) VALUES (1, 1, 'avv_rossi', 'rossi@studio.it', 'Avvocato')"
    );
    db.run(
      "INSERT OR IGNORE INTO User (id, studio_id, username, email, role) VALUES (2, 1, 'seg_mario', 'mario@studio.it', 'Segretario')"
    );
    db.run(
      "INSERT OR IGNORE INTO User (id, studio_id, username, email, role) VALUES (3, 2, 'comm_bianchi', 'bianchi@commercialisti.it', 'Commercialista')"
    );

    // Insert Clients
    db.run(
      "INSERT OR IGNORE INTO Client (id, studio_id, name, address, tax_id, fiscal_context) VALUES (1, 1, 'Azienda XYZ Srl', 'Via Milano 10, Milano', '12345678901', 'PMI')"
    );
    db.run(
      "INSERT OR IGNORE INTO Client (id, studio_id, name, address, tax_id, fiscal_context) VALUES (2, 1, 'Ditta Verdi', 'Via Torino 5, Milano', '98765432101', 'Ditta Individuale')"
    );
    db.run(
      "INSERT OR IGNORE INTO Client (id, studio_id, name, address, tax_id, fiscal_context) VALUES (3, 2, 'Holding ABC', 'Corso Roma 20, Roma', '11111111111', 'Holding')"
    );

    // Insert AML Files
    db.run(
      "INSERT OR IGNORE INTO AMLFile (id, client_id, status, risk_rating, last_updated) VALUES (1, 1, 'Approvato', 'Basso', datetime('now'))"
    );
    db.run(
      "INSERT OR IGNORE INTO AMLFile (id, client_id, status, risk_rating, last_updated) VALUES (2, 2, 'In revisione', 'Medio', datetime('now'))"
    );
    db.run(
      "INSERT OR IGNORE INTO AMLFile (id, client_id, status, risk_rating, last_updated) VALUES (3, 3, 'Approvato', 'Alto', datetime('now'))"
    );

    // Insert GDPR Registers
    db.run(
      "INSERT OR IGNORE INTO GDPRRegister (id, client_id, data_subject_name, data_category, processing_purpose, gdpr_status) VALUES (1, 1, 'Dipendenti', 'Dati comuni', 'Gestione contratto di lavoro', 'Compliant')"
    );
    db.run(
      "INSERT OR IGNORE INTO GDPRRegister (id, client_id, data_subject_name, data_category, processing_purpose, gdpr_status) VALUES (2, 1, 'Clienti', 'Dati comuni', 'Gestione fatturazione', 'Compliant')"
    );
    db.run(
      "INSERT OR IGNORE INTO GDPRRegister (id, client_id, data_subject_name, data_category, processing_purpose, gdpr_status) VALUES (3, 2, 'Fornitori', 'Dati comuni', 'Gestione ordini', 'In revisione')"
    );

    // Insert Tasks
    db.run(
      "INSERT OR IGNORE INTO Task (id, assigned_to_user_id, client_id, description, due_date, status) VALUES (1, 1, 1, 'Verificare documentazione AML', datetime('now', '+7 days'), 'In corso')"
    );
    db.run(
      "INSERT OR IGNORE INTO Task (id, assigned_to_user_id, client_id, description, due_date, status) VALUES (2, 2, 2, 'Aggiornare registro GDPR', datetime('now', '+3 days'), 'In corso')"
    );
    db.run(
      "INSERT OR IGNORE INTO Task (id, assigned_to_user_id, client_id, description, due_date, status) VALUES (3, 3, 3, 'Revisione compliance annuale', datetime('now', '+14 days'), 'In attesa')"
    );
    db.run(
      "INSERT OR IGNORE INTO Task (id, assigned_to_user_id, description, due_date, status) VALUES (4, 1, 'Riunione con cliente', datetime('now', '+1 days'), 'In corso')"
    );

    console.log('Database seeded successfully!');
  });
};

// Run seed if this file is executed directly
if (require.main === module) {
  setTimeout(() => {
    seedData();
    db.close();
  }, 1000);
}

module.exports = seedData;
