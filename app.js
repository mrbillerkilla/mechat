const express = require('express');
const session = require('express-session');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
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
saveUninitialized: true }
));

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

        res.redirect('/index.html')
    } catch (err) {
        console.error('Fout bij registratie:', err);
        res.status(500).send('Er is een fout opgetreden.');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
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

        // Sla gebruikersinformatie op in de sessie
        req.session.user = {
            id: user[0].id,
            username: user[0].username,
        };

        console.log('Gebruiker succesvol ingelogd:', req.session.user);
        res.redirect('/home');
    } catch (err) {
        console.error('Fout bij inloggen:', err);
        res.status(500).send('Er is een fout opgetreden.');
    }
});



// app.post('/login', (req, res) => {
//     const { username, password } = req.body;

//     if (username && password) {
//         connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
//             if (error) {
//                 console.error(error);
//                 res.send('Er is een fout opgetreden bij het inloggen.');
//             } else {
//                 if (results.length > 0) {
//                     const user = results[0];

//                     // Controleer het ingevoerde wachtwoord met bcrypt
//                     bcrypt.compare(password, user.password, (err, isMatch) => {
//                         if (err) {
//                             console.error(err);
//                             res.send('Er is een fout opgetreden.');
//                         } else if (isMatch) {
//                             // Redirect naar home.html
//                             res.redirect('/home');
//                         } else {
//                             res.send('Ongeldige inloggegevens.');
//                         }
//                     });
//                 } else {
//                     res.send('Gebruiker niet gevonden.');
//                 }
//             }
//         });
//     } else {
//         res.send('Vul zowel gebruikersnaam als wachtwoord in.');
//     }
// });

// Groepen ophalen
app.get('/api/groups', async (req, res) => {
    try {
        const [groups] = await pool.promise().query('SELECT `group_name` FROM `groups`'); // Haal alleen groups_name op
        res.json(groups); // Stuur als JSON naar de frontend
    } catch (err) {
        console.error('Fout bij ophalen van groepen:', err);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van groepen.');
    }
});

app.post('/api/groups', async (req, res) => {
    const { group_name } = req.body;

    try {
        const [result] = await pool.promise().query(
            'INSERT INTO groups (group_name) VALUES (?)',
            [group_name]
        );
        res.status(201).json({ group_id: result.insertId, message: 'Groep aangemaakt!' });
    } catch (err) {
        console.error('Fout bij aanmaken van groep:', err);
        res.status(500).send('Er is een fout opgetreden bij het aanmaken van de groep.');
    }
});

app.get('/api/group-messages/:group_id', async (req, res) => {
    const { group_id } = req.params;

    try {
        const [messages] = await pool.promise().query(
            `SELECT gm.message, gm.created_at, u.username 
             FROM group_messages gm 
             JOIN users u ON gm.sender_id = u.id 
             WHERE gm.group_id = ? 
             ORDER BY gm.created_at ASC`,
            [group_id]
        );
        res.json(messages); // Stuur de berichten terug
    } catch (err) {
        console.error('Fout bij ophalen van berichten:', err);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van berichten.');
    }
});

app.post('/api/group-messages', async (req, res) => {
    const { group_id, sender_id, message } = req.body;

    try {
        await pool.promise().query(
            'INSERT INTO group_messages (group_id, sender_id, message) VALUES (?, ?, ?)',
            [group_id, sender_id, message]
        );
        res.status(201).send('Bericht opgeslagen');
    } catch (err) {
        console.error('Fout bij opslaan van bericht:', err);
        res.status(500).send('Er is een fout opgetreden bij het opslaan van het bericht.');
    }
});



app.get('/api/users', async (req, res) => {
    try {
        const [users] = await pool.promise().query('SELECT username FROM users');
        res.json(users); // Stuur de lijst met gebruikers terug als JSON
    } catch (err) {
        console.error('Fout bij ophalen van gebruikers:', err);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van gebruikers.');
    }
});

app.get('/api/user', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Niet ingelogd' });
    }
    res.json(req.session.user); // Verzend user-object uit de sessie
});


const saveMessage = async (groupId, userId, message) => {
    try {
        const query = `INSERT INTO group_messages (group_id, sender_id, message, created_at) VALUES (?, ?, ?, NOW())`;
        await pool.promise().query(query, [groupId, userId, message]);
        console.log(`Bericht opgeslagen in groep ${groupId} door gebruiker ${userId}`);
    } catch (err) {
        console.error('Fout bij opslaan van bericht:', err);
        throw err; // Gooi de fout opnieuw als je de caller wilt laten weten dat er iets misging
    }
};

const getMessages = async (groupId) => {
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
        throw err; // Gooi de fout opnieuw als je de caller wilt laten weten dat er iets misging
    }
};


// Socket.IO Event-handlers
io.on('connection', (socket) => {
    console.log(`Een gebruiker is verbonden: ${socket.id}`);

    // Handeling voor privéberichten
    socket.on('privateMessage', (data) => {
        console.log(`Privébericht ontvangen van ${socket.id}:`, data);

        // Verstuur privébericht naar specifieke gebruiker
        io.to(data.to).emit('privateMessage', {
            from: socket.id,
            message: data.message,
        });
    });

    // Handeling voor groepsberichten
    socket.on('groupMessage', (data) => {
        console.log(`Groepsbericht ontvangen in groep ${data.group}:`, data);

        // Verstuur groepsbericht naar iedereen in de groep
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

        // Voeg de gebruiker toe aan de groep
        const groupRoom = `group_${groupId}`;
        socket.join(groupRoom);
        console.log(`Gebruiker ${userId} is toegetreden tot groep ${groupId}`);

        // Stuur bestaande berichten naar de gebruiker
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
            // Sla het bericht op in de database
            await saveMessage(groupId, userId, message);

            // Verstuur het nieuwe bericht naar de groep
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


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server draait op http://localhost:${PORT}`);
});
