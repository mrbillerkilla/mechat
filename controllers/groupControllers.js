const pool = require('../db'); // Zorg ervoor dat je een correcte DB-verbinding hebt
const { getMessages, saveMessage } = require('../models/messageModel');


exports.getGroups = (req, res) => {
    pool.query('SELECT * FROM `groups`', (err, results) => {
        if (err) {
            console.error('Databasefout:', err);
            return res.status(500).json({ message: 'Fout bij het ophalen van groepen.' });
        }
        res.status(200).json(results);
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
            'INSERT INTO groups (group_name) VALUES (?)',
            [group_name]
        );
        res.status(201).json({ group_id: result.insertId, message: 'Groep succesvol aangemaakt!' });
    } catch (err) {
        console.error('Fout bij aanmaken van groep:', err);
        res.status(500).send('Er is een fout opgetreden bij het aanmaken van de groep.');
    }
};

// Haal berichten van een groep op
exports.getGroupMessages = async (req, res) => {
    const { group_id } = req.params;

    if (!group_id) {
        return res.status(400).send('Group ID is vereist.');
    }

    try {
        const messages = await getMessages(group_id);
        res.status(200).json(messages);
    } catch (err) {
        console.error('Fout bij ophalen van berichten:', err);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van berichten.');
    }
};

// Sla een bericht op in een groep
exports.saveGroupMessage = async (req, res) => {
    const { group_id, sender_id, message } = req.body;

    if (!group_id || !sender_id || !message) {
        return res.status(400).send('Group ID, Sender ID en bericht zijn vereist.');
    }

    try {
        await saveMessage(group_id, sender_id, message);
        res.status(201).send('Bericht succesvol opgeslagen.');
    } catch (err) {
        console.error('Fout bij opslaan van bericht:', err);
        res.status(500).send('Er is een fout opgetreden bij het opslaan van het bericht.');
    }
};
