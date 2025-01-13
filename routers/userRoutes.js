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

module.exports = router;
