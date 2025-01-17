const express = require('express');

const router = express.Router();
const {
    showHomePage,
    showRegisterPage,
    registerUser,
    loginUser
} = require('../controllers/userController'); // Zorg ervoor dat dit naar de juiste controller verwijst

// Route voor de homepage
router.get('/', showHomePage);

// Route voor registratiepagina
router.get('/register', showRegisterPage);

// Route voor registratiefunctionaliteit
router.post('/register', registerUser);

// Route voor inloggen
router.post('/login', loginUser);

// Route to get user info
router.get('/user-info', (req, res) => {
    if (req.session.userId && req.session.username) {
        res.json({ userId: req.session.userId, username: req.session.username });
    } else {
        res.status(401).send('Niet ingelogd');
    }
});

module.exports = router;
