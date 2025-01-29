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
    const { group_id } = req.params;

    if (!group_id) {
        return res.status(400).json({ error: 'Group ID is required.' });
    }

    try {
        const messages = await getMessages(group_id);
        if (!messages.length) {
            return res.status(404).json({ error: 'No messages found for this group.' });
        }
        res.status(200).json(messages);
    } catch (err) {
        console.error('Error fetching group messages:', err);
        res.status(500).json({ error: 'Error fetching messages.' });
    }
};




// Sla een bericht op in een groep
exports.saveGroupMessage = async (req, res) => {
    const { group_id, sender_id, message } = req.body;

    if (!group_id || !sender_id || !message) {
        return res.status(400).json({ error: 'Group ID, sender ID en bericht zijn vereist.' });
    }

    try {
        await saveMessage(group_id, sender_id, message);
        res.status(201).json({ message: 'Bericht succesvol opgeslagen', username: req.session.username });
    } catch (err) {
        console.error('Fout bij opslaan van bericht:', err);
        res.status(500).json({ error: 'Er is een fout opgetreden bij het opslaan van het bericht.' });
    }
};


