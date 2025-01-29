const pool = require('../db');

// Bericht opslaan in de database
// exports.saveMessage = async (groupId, userId, message) => {
//     try {
//         const query = `INSERT INTO group_messages (group_id, sender_id, message, created_at) VALUES (?, ?, ?, NOW())`;
//         await pool.promise().query(query, [groupId, userId, message]);
//         console.log(`Bericht opgeslagen in groep ${groupId} door gebruiker ${userId}`);
//     } catch (err) {
//         console.error('Fout bij opslaan van bericht:', err);
//         throw err; // Laat de caller weten dat er iets fout ging
//     }
// };

exports.saveMessage = async (group_id, sender_id, message) => {
    try {
        await pool.query('INSERT INTO messages (group_id, sender_id, message) VALUES (?, ?, ?)', [
            group_id,
            sender_id,
            message,
        ]);
        console.log('Bericht succesvol opgeslagen in de database.');
    } catch (err) {
        console.error('Fout bij het opslaan van bericht in de database:', err);
        throw err;  // Gooi de fout omhoog zodat de controller het kan afhandelen
    }
};


// Berichten ophalen van een specifieke groep
exports.getMessages = async (groupId) => {
    try {
        const [messages] = await pool.promise().query(
            `SELECT gm.message, gm.created_at, u.username 
             FROM group_messages gm 
             JOIN users u ON gm.sender_id = u.id 
             WHERE gm.group_id = ? 
             ORDER BY gm.created_at ASC`,
            [groupId]
        );
        return messages;
    } catch (err) {
        console.error('Fout bij ophalen van berichten:', err);
        throw err; // Laat de caller weten dat er iets fout ging
    }
};
