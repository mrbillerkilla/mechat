const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupControllers');

// Controleer of alle functies juist geïmporteerd zijn
console.log('Gevonden controller-functies:', Object.keys(groupController));

// Routes voor groepen
router.get('/groups', groupController.getGroups); // Haal alle groepen op
router.post('/groups', groupController.createGroup);
router.get('/groups/:group_id/messages', groupController.getGroupMessages); // Haal berichten op voor een specifieke groep

// Route voor het opslaan van een bericht in een groep
router.post('/groups/:group_id/messages', groupController.saveGroupMessage); // Sla een bericht op in een groep

// Route voor gebruikersinformatie
router.get('/user-info', (req, res) => {
    if (req.session && req.session.userId && req.session.username) {
        res.json({ userId: req.session.userId, username: req.session.username });
    } else {
        // Altijd een geldige JSON teruggeven bij foutmeldingen
        res.status(401).json({ error: 'Niet ingelogd' });
    }
});

module.exports = router;
