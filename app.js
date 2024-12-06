const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Sta verbindingen toe vanaf elke origin (ontwikkelingsfase)
        methods: ['GET', 'POST'],
    },
});

// Stel de public map in voor statische bestanden
app.use(express.static(path.join(__dirname, 'public')));

// Stel views map in voor rendering (optioneel als je templating engines gebruikt)
app.set('views', path.join(__dirname, 'public'));

// Stel de weergave-engine in (optioneel, als je geen templating-engine gebruikt, kun je dit weglaten)
app.set('view engine', 'html');

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

// Socket.IO Event-handlers
io.on('connection', (socket) => {
    console.log(`Een gebruiker is verbonden: ${socket.id}`);

    // Privéberichten
    socket.on('privateMessage', (data) => {
        console.log(`Privébericht ontvangen van ${socket.id}:`, data);
        io.to(data.to).emit('privateMessage', {
            from: socket.id,
            message: data.message,
        });
    });

    // Groepsberichten
    socket.on('groupMessage', (data) => {
        console.log(`Groepsbericht ontvangen in groep ${data.group}:`, data);
        io.to(data.group).emit('groupMessage', {
            from: socket.id,
            message: data.message,
        });
    });

    // Toetreden tot een groep
    socket.on('joinGroup', (group) => {
        socket.join(group);
        console.log(`${socket.id} is toegetreden tot groep: ${group}`);
    });

    // Verbreken van de verbinding
    socket.on('disconnect', () => {
        console.log(`Een gebruiker is losgekoppeld: ${socket.id}`);
    });
});

// Route voor de homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start de server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server draait op http://localhost:${PORT}`);
});
