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

exports.saveMessage = async (groupId, senderId, message) => {
    try {
        const query = `
            INSERT INTO group_messages (group_id, sender_id, message) 
            VALUES (?, ?, ?)
        `;
        await pool.promise().query(query, [groupId, senderId, message]);
        console.log("Bericht opgeslagen in database.");
    } catch (err) {
        console.error("Fout bij opslaan van bericht in de database:", err);
        throw err;
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
