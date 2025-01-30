const { saveMessage } = require('../models/messageModel');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Gebruiker verbonden met socket ID: ${socket.id}`);

        socket.on('joinGroup', ({ groupId, userId }) => {
            const roomName = `group_${groupId}`;
            socket.join(roomName);
            console.log(`Gebruiker ${userId} heeft groep ${roomName} gejoined.`);
        });

        socket.on('sendMessage', async ({ groupId, userId, message, username }) => {
            try {
                // Sla het bericht op in de database
                await saveMessage(groupId, userId, message);
                console.log('Bericht opgeslagen in de database:', message);

                // Stuur het bericht naar alle clients in de groep
                io.to(`group_${groupId}`).emit('newMessage', { username, message });
            } catch (err) {
                console.error('Fout bij opslaan van bericht:', err);
            }
        });
    });
};
