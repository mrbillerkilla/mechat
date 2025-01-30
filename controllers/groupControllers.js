const pool = require('../db'); // Zorg ervoor dat je een correcte DB-verbinding hebt
const { getMessages, saveMessage } = require('../models/messageModel');


exports.getGroups = (req, res) => {
    pool.query('SELECT * FROM `groups`', (err, results) => {
        if (err) {
            console.error('Databasefout:', err); // Log fout als er een probleem is
            return res.status(500).json({ message: 'Fout bij ophalen van groepen.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Geen groepen gevonden.' });
        }
        res.status(200).json(results); // Retourneer opgehaalde groepen
    });
};





// Maak een nieuwe groep aan
exports.createGroup = async (req, res) => {
    const { group_name } = req.body;

    if (!group_name) {
        return res.status(400).send('Group name is vereist.');
    }

    try {
        const [result] = await pool.promise().query(
            'INSERT INTO `groups` (group_name) VALUES (?)', // Backticks rond `groups`
            [group_name]
        );
        res.status(201).json({ group_id: result.insertId, message: 'Groep succesvol aangemaakt!' });
    } catch (err) {
        console.error('Fout bij aanmaken van groep:', err);
        res.status(500).send('Er is een fout opgetreden bij het aanmaken van de groep.');
    }
};

// Haal berichten van een groep op
// exports.getGroupMessages = async (req, res) => {
//     const { group_id } = req.params;

//     if (!group_id) {
//         return res.status(400).send('Group ID is vereist.');
//     }

//     try {
//         const messages = await getMessages(group_id);
//         res.status(200).json(messages);
//     } catch (err) {
//         console.error('Fout bij ophalen van berichten:', err);
//         res.status(500).send('Er is een fout opgetreden bij het ophalen van berichten.');
//     }
// };

exports.getGroupMessages = async (req, res) => {
    const groupId = req.params.group_id;
    try {
        const messages = await getMessages(groupId);  // Zorg dat dit correct werkt
        res.status(200).json(messages);
    } catch (err) {
        console.error('Fout bij ophalen van berichten:', err);
        res.status(500).send('Er is een fout opgetreden.');
    }
};





// Sla een bericht op in een groep
exports.getMessages = async (groupId) => {
    try {
        const [messages] = await pool.promise().query(
            `SELECT gm.message, gm.created_at, u.username 
             FROM group_messages gm 
             JOIN users u ON gm.sender_id = u.id 
             WHERE gm.group_id = ? 
             ORDER BY gm.created_at ASC`,
            [groupId]  // Vervang '?' met de opgegeven groupId
        );
        return messages;  // Stuur de opgehaalde berichten terug naar de caller
    } catch (err) {
        console.error('Fout bij ophalen van berichten:', err);
        throw err;  // Laat de caller weten dat er iets misging
    }
};


exports.saveGroupMessage = async (req, res) => {
    const { message } = req.body;
    const groupId = req.params.group_id;
    const senderId = req.session.userId;  // Zorg dat de gebruiker is ingelogd

    if (!message || !groupId || !senderId) {
        return res.status(400).json({ error: 'Ongeldige invoer' });
    }

    try {
        const result = await pool.promise().query(
            'INSERT INTO group_messages (group_id, sender_id, message) VALUES (?, ?, ?)',
            [groupId, senderId, message]
        );
        res.status(201).json({ message: 'Bericht succesvol opgeslagen' });
    } catch (err) {
        console.error('Fout bij opslaan van bericht:', err);
        res.status(500).json({ error: 'Er ging iets fout bij het opslaan van het bericht' });
    }
};