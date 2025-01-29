const { saveMessage, getMessages } = require('../models/messageModel');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Een gebruiker is verbonden: ${socket.id}`);

        // Gebruiker sluit aan bij een groep
        socket.on('joinGroup', async ({ groupId, userId }) => {
            if (!groupId || !userId) {
                console.error("Group ID of User ID ontbreekt bij het joinen van een groep.");
                socket.emit('errorMessage', "Group ID or User ID is missing.");
                return;
            }

            const groupRoom = `group_${groupId}`;
            socket.join(groupRoom);
            console.log(`Gebruiker ${userId} is toegetreden tot groep ${groupId}`);

            try {
                // Haal bestaande berichten op en stuur ze naar de gebruiker
                const messages = await getMessages(groupId);
                socket.emit('groupMessages', messages);
            } catch (err) {
                console.error('Fout bij ophalen van berichten:', err);
                socket.emit('errorMessage', 'Er is een fout opgetreden bij het ophalen van berichten.');
            }
        });

        // Gebruiker verzendt een bericht naar een groep
        socket.on('sendMessage', async ({ groupId, userId, message, username }) => {
            if (!groupId || !userId || !message || !username) {
                console.error('Group ID, User ID, bericht of gebruikersnaam ontbreekt.');
                return;
            }
        
            // Direct het bericht broadcasten
            const groupRoom = `group_${groupId}`;
            io.to(groupRoom).emit('newMessage', { username, message });
        
            try {
                // Sla het bericht asynchroon op in de database zonder de gebruikerservaring te blokkeren
                await saveMessage(groupId, userId, message);
                console.log('Bericht succesvol opgeslagen.');
            } catch (err) {
                console.error('Fout bij opslaan van bericht:', err);
            }
        });
        
        
        
        
        
        
        
        
        

        // Handeling voor privéberichten (optioneel: alleen als je dit echt nodig hebt)
        socket.on('privateMessage', (data) => {
            if (!data.to || !data.message) {
                console.error("Privébericht ontbreekt ontvanger of inhoud.");
                socket.emit('errorMessage', 'Ontvanger of bericht ontbreekt.');
                return;
            }

            console.log(`Privébericht ontvangen van ${socket.id}:`, data);
            io.to(data.to).emit('privateMessage', {
                from: socket.id,
                message: data.message,
            });
        });

        // Gebruiker verbreekt de verbinding
        socket.on('disconnect', () => {
            console.log(`Een gebruiker is losgekoppeld: ${socket.id}`);
        });
    });
};
