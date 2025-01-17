const express = require('express');
const session = require('express-session');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const userRoutes = require('./routers/userRoutes');
const groupRoutes = require('./routers/groupRoutes');

dotenv.config(); // Zorg dat dotenv direct bovenaan staat

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware voor body parsing en statische bestanden
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessie instellen
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Zet op true als HTTPS actief is
}));

// Stel views map in voor rendering
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'html');

// Specifieke route voor de homepagina
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Gebruik de routes
app.use('/', userRoutes);
app.use('/', groupRoutes);

app.use((req, res, next) => {
    console.log('Session:', req.session);
    next();
});


// Start de server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server draait op http://localhost:${PORT}`);
});
