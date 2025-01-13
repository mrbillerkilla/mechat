const { saveMessage, getMessages } = require('../models/messageModel');

// Handeling om berichten op te halen
exports.fetchGroupMessages = async (req, res) => {
    const { group_id } = req.params;

    try {
        const messages = await getMessages(group_id);
        res.json(messages); // Stuur de berichten terug naar de frontend
    } catch (err) {
        console.error('Fout bij ophalen van berichten:', err);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van berichten.');
    }
};

// Handeling om een nieuw bericht op te slaan
exports.postGroupMessage = async (req, res) => {
    const { group_id, sender_id, message } = req.body;

    try {
        await saveMessage(group_id, sender_id, message);
        res.status(201).send('Bericht opgeslagen');
    } catch (err) {
        console.error('Fout bij opslaan van bericht:', err);
        res.status(500).send('Er is een fout opgetreden bij het opslaan van het bericht.');
    }
};
