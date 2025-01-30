const express = require('express');
const session = require('express-session');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const cors = require('cors');
const sharedSession = require('socket.io-express-session');

const userRoutes = require('./routers/userRoutes');
const groupRoutes = require('./routers/groupRoutes');

dotenv.config(); // Zorg dat dotenv direct bovenaan staat

const app = express();

const server = http.createServer(app);

app.use(cors({
    origin: '*',  // Of specificeer je frontend-URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));


const io = new Server(server, {
    cors: {
        origin: '*',  // Of specifiek je frontend-URL
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Middleware voor sessies
const sessionMiddleware = session({
    secret: 'mama',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,         // Zet op true als je HTTPS gebruikt
        httpOnly: true,        // Maak de cookie alleen toegankelijk voor de server
        maxAge: 3600000        // 1 uur
    }
});

app.use(sessionMiddleware);

// Deel sessie tussen Express en Socket.IO
io.use(sharedSession(sessionMiddleware, {
    autoSave: true
}));
// Middleware voor body parsing en statische bestanden
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
