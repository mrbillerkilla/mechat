const { findUserByUsername, createUser } = require('../models/usermodel');
const bcrypt = require('bcrypt');
const path = require('path');
const pool = require('../db');

exports.showHomePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
};

exports.showRegisterPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'register.html'));
};

exports.registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Controleer of de gebruikersnaam al bestaat
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(400).send('Gebruikersnaam bestaat al!');
        }

        // Wachtwoord versleutelen
        const hashedPassword = await bcrypt.hash(password, 10);

        // Nieuwe gebruiker toevoegen aan database
        await createUser(username, hashedPassword);

        res.redirect('/index.html');
    } catch (err) {
        console.error('Fout bij registratie:', err);
        res.status(500).send('Er is een fout opgetreden.');
    }
};

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await findUserByUsername(username);

        if (!user) {
            return res.status(400).send('Gebruikersnaam bestaat niet.');
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).send('Onjuist wachtwoord.');
        }

        // Sla gebruikersinformatie op in de sessie
        req.session.user = {
            id: user.id,
            username: user.username,
        };

        console.log('Gebruiker succesvol ingelogd:', req.session.user);
        res.redirect('/home');
    } catch (err) {
        console.error('Fout bij inloggen:', err);
        res.status(500).send('Er is een fout opgetreden.');
    }
};


// Haal groepen op
exports.getGroups = async (req, res) => {
    try {
        const [groups] = await pool.promise().query('SELECT id, group_name FROM groups');
        res.json(groups);
    } catch (err) {
        console.error('Fout bij ophalen van groepen:', err);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van groepen.');
    }
};

// Maak een nieuwe groep
exports.createGroup = async (req, res) => {
    const { group_name } = req.body;

    try {
        const [result] = await pool.promise().query(
            'INSERT INTO groups (group_name) VALUES (?)',
            [group_name]
        );
        res.status(201).json({ group_id: result.insertId, message: 'Groep aangemaakt!' });
    } catch (err) {
        console.error('Fout bij aanmaken van groep:', err);
        res.status(500).send('Er is een fout opgetreden bij het aanmaken van de groep.');
    }
};

// Haal berichten van een groep op
exports.getGroupMessages = async (req, res) => {
    const { group_id } = req.params;

    try {
        const [messages] = await pool.promise().query(
            `SELECT gm.message, gm.created_at, u.username 
             FROM group_messages gm 
             JOIN users u ON gm.sender_id = u.id 
             WHERE gm.group_id = ? 
             ORDER BY gm.created_at ASC`,
            [group_id]
        );
        res.json(messages);
    } catch (err) {
        console.error('Fout bij ophalen van berichten:', err);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van berichten.');
    }
};

// Sla een bericht op
exports.saveGroupMessage = async (req, res) => {
    const { group_id, sender_id, message } = req.body;

    try {
        await pool.promise().query(
            'INSERT INTO group_messages (group_id, sender_id, message) VALUES (?, ?, ?)',
            [group_id, sender_id, message]
        );
        res.status(201).send('Bericht opgeslagen');
    } catch (err) {
        console.error('Fout bij opslaan van bericht:', err);
        res.status(500).send('Er is een fout opgetreden bij het opslaan van het bericht.');
    }
};













