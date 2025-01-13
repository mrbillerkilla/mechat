const pool = require('../db');

// Vind een gebruiker op basis van gebruikersnaam
exports.findUserByUsername = async (username) => {
    const [rows] = await pool.promise().query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0]; // Retourneer de eerste gebruiker of undefined
};

// Maak een nieuwe gebruiker
exports.createUser = async (username, hashedPassword) => {
    await pool.promise().query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
};
