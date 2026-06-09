// src/config/db.js
const mysql = require('mysql2/promise');

// Creiamo un pool di connessioni, più efficiente per le app web rispetto a una connessione singola
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'studio_medico',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test di connessione immediato all'avvio del server
pool.getConnection()
  .then(connection => {
    console.log('✅ Connessione al database MySQL (studio_medico) riuscita!');
    connection.release(); // Rilascia la connessione nel pool
  })
  .catch(err => {
    console.error('❌ Errore di connessione al database:', err.message);
  });

module.exports = pool;