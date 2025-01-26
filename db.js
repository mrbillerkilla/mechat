require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, // Wacht tot er een verbinding beschikbaar is
    connectionLimit: 99, // Maximum aantal verbindingen in de pool
    // queueLimit: 0, 
});

module.exports = pool;

// Controleer databaseverbinding
pool.promise()
    .query('SELECT 1')
    .then(() => {
        console.log('Succesvol verbonden met de database!');
    })
    .catch((err) => {
        console.error('Databaseverbinding mislukt:', err.message);
    });
