const express = require('express');
const http = require('http');
const path = require('path'); // Zorg dat je 'path' gebruikt
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Pas dit aan voor veiligheid in productie
    },
});

// Stel de public map in voor statische bestanden
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, "public"));

// Maak een pool voor databaseverbindingen
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.promise()
    .query('SELECT 1')
    .then(() => {
        console.log('Succesvol verbonden met de database!');
    })
    .catch((err) => {
        console.error('Databaseverbinding mislukt:', err.message);
    });

// Socket.IO Events
io.on('connection', (socket) => {
    console.log('Een gebruiker is verbonden:', socket.id);

    // Luisteren naar berichten van de client
    socket.on('privateMessage', (data) => {
        console.log('Privébericht ontvangen:', data);
        // Stuur het bericht naar de specifieke ontvanger
        io.to(data.to).emit('privateMessage', data);
    });

    socket.on('groupMessage', (data) => {
        console.log('Groepsbericht ontvangen:', data);
        // Stuur het bericht naar de groep
        io.to(data.group).emit('groupMessage', data);
    });

    // Een gebruiker toetreedt tot een groep
    socket.on('joinGroup', (group) => {
        socket.join(group);
        console.log(`${socket.id} is toegetreden tot groep: ${group}`);
    });

    socket.on('disconnect', () => {
        console.log('Een gebruiker is losgekoppeld:', socket.id);
    });
});

app.get('/', async function (req, res){
    res.render('index')
})

// Start de server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server draait op http://localhost:${PORT}`);
});
