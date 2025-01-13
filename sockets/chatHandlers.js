const { saveMessage, getMessages } = require('../models/messageModel');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Een gebruiker is verbonden: ${socket.id}`);

        // Handeling voor privéberichten
        socket.on('privateMessage', (data) => {
            console.log(`Privébericht ontvangen van ${socket.id}:`, data);

            io.to(data.to).emit('privateMessage', {
                from: socket.id,
                message: data.message,
            });
        });

        // Handeling voor groepsberichten
        socket.on('groupMessage', (data) => {
            console.log(`Groepsbericht ontvangen in groep ${data.group}:`, data);

            io.to(data.group).emit('groupMessage', {
                from: socket.id,
                message: data.message,
            });
        });

        // Gebruiker sluit aan bij een groep
        socket.on('joinGroup', async ({ groupId, userId }) => {
            if (!groupId || !userId) {
                console.error("Group ID of User ID ontbreekt bij het joinen van een groep.");
                return;
            }

            const groupRoom = `group_${groupId}`;
            socket.join(groupRoom);
            console.log(`Gebruiker ${userId} is toegetreden tot groep ${groupId}`);

            try {
                const messages = await getMessages(groupId);
                socket.emit('groupMessages', messages);
            } catch (err) {
                console.error('Fout bij ophalen van berichten:', err);
            }
        });

        // Gebruiker verzendt een bericht naar een groep
        socket.on('sendMessage', async ({ groupId, userId, message }) => {
            if (!groupId || !userId || !message) {
                console.error("Group ID, User ID of bericht ontbreekt bij het versturen van een bericht.");
                return;
            }

            try {
                await saveMessage(groupId, userId, message);

                const groupRoom = `group_${groupId}`;
                io.to(groupRoom).emit('newMessage', {
                    username: `User ${userId}`,
                    message,
                });
            } catch (err) {
                console.error("Fout bij het opslaan van het bericht:", err);
            }
        });

        // Gebruiker verbreekt de verbinding
        socket.on('disconnect', () => {
            console.log(`Een gebruiker is losgekoppeld: ${socket.id}`);
        });
    });
};
