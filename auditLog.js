const db = require("../db");

const logAudit = (userId, studioId, action, entityType, entityId, oldValue = null, newValue = null) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO AuditLog (user_id, studio_id, action, entity_type, entity_id, old_value, new_value)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, studioId, action, entityType, entityId, oldValue, newValue],
      function (err) {
        if (err) {
          console.error("Error logging audit:", err);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

module.exports = { logAudit };
