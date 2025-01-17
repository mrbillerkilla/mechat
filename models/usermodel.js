const pool = require('../db');

exports.findUserByUsername = async (username) => {
    const [rows] = await pool.promise().query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
};

exports.createUser = async (username, hashedPassword) => {
    const [result] = await pool.promise().query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
    );
    return { id: result.insertId, username }; // Return the new user's ID and username
};
