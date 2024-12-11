const express = require('express');
const session = require('express-session');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Sta verbindingen toe vanaf elke origin (ontwikkelingsfase)
        methods: ['GET', 'POST'],
    },
});


// Middleware voor body parsing en statische bestanden
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Stel views map in voor rendering (optioneel als je templating engines gebruikt)
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'html');

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.use(session({
secret: "MAMA",
resave: false,
saveUninitialized: true }));


// Maak een pool voor databaseverbindingen
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Controleer databaseverbinding
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

    socket.on('privateMessage', (data) => {
        console.log(`Privébericht ontvangen van ${socket.id}:`, data);
        io.to(data.to).emit('privateMessage', {
            from: socket.id,
            message: data.message,
        });
    });

    socket.on('groupMessage', (data) => {
        console.log(`Groepsbericht ontvangen in groep ${data.group}:`, data);
        io.to(data.group).emit('groupMessage', {
            from: socket.id,
            message: data.message,
        });
    });

    socket.on('joinGroup', (group) => {
        socket.join(group);
        console.log(`${socket.id} is toegetreden tot groep: ${group}`);
    });

    socket.on('disconnect', () => {
        console.log(`Een gebruiker is losgekoppeld: ${socket.id}`);
    });
});

// Route voor de homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Registratiepagina
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Registratiefunctionaliteit
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Controleer of de gebruikersnaam al bestaat
        const [existingUser] = await pool.promise().query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        if (existingUser.length > 0) {
            return res.status(400).send('Gebruikersnaam bestaat al!');
        }

        // Wachtwoord versleutelen
        const hashedPassword = await bcrypt.hash(password, 10);

        // Nieuwe gebruiker toevoegen aan database
        await pool.promise().query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        res.redirect('/')
    } catch (err) {
        console.error('Fout bij registratie:', err);
        res.status(500).send('Er is een fout opgetreden.');
    }
});

// Login-functionaliteit
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Controleer of de gebruiker bestaat
        const [user] = await pool.promise().query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (user.length === 0) {
            return res.status(400).send('Gebruikersnaam bestaat niet.');
        }

        const validPassword = await bcrypt.compare(password, user[0].password);

        if (!validPassword) {
            return res.status(400).send('Onjuist wachtwoord.');
        }

        // Login succesvol - Sla gebruiker op in sessie
        req.session.user = {
            id: user[0].id,
            username: user[0].username,
        };

        console.log('Gebruiker succesvol ingelogd:', req.session.user);

        // Redirect naar home.html
        res.redirect('/home');
    } catch (err) {
        console.error('Fout bij inloggen:', err);
        res.status(500).send('Er is een fout opgetreden.');
    }
});


// Login-functionaliteit
// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         // Controleer of de gebruiker bestaat
//         const [user] = await pool.promise().query(
//             'SELECT * FROM users WHERE username = ?',
//             [username]
//         );

//         if (user.length === 0) {
//             return res.status(400).send('Gebruikersnaam bestaat niet.');
//         }

//         const validPassword = await bcrypt.compare(password, user[0].password);

//         if (!validPassword) {
//             return res.status(400).send('Onjuist wachtwoord.');
//         }

//         // Login succesvol
//         res.redirect('/home.html'); // Pas aan naar de gewenste pagina na login
//     } catch (err) {
//         console.error('Fout bij inloggen:', err);
//         res.status(500).send('Er is een fout opgetreden.');
//     }
// });

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
            if (error) {
                console.error(error);
                res.send('Er is een fout opgetreden bij het inloggen.');
            } else {
                if (results.length > 0) {
                    const user = results[0];

                    // Controleer het ingevoerde wachtwoord met bcrypt
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            console.error(err);
                            res.send('Er is een fout opgetreden.');
                        } else if (isMatch) {
                            // Redirect naar home.html
                            res.redirect('/home');
                        } else {
                            res.send('Ongeldige inloggegevens.');
                        }
                    });
                } else {
                    res.send('Gebruiker niet gevonden.');
                }
            }
        });
    } else {
        res.send('Vul zowel gebruikersnaam als wachtwoord in.');
    }
});



// Start de server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server draait op http://localhost:${PORT}`);
});
