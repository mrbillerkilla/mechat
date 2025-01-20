const express = require('express');
const router = express.Router();

const getGroups = (req, res) => {
    res.json({ message: 'List of groups' });
};

const createGroup = (req, res) => {
    res.json({ message: 'Group created' });
};

const getGroupMessages = (req, res) => {
    const groupId = req.params.group_id;
    console.log('Group ID:', groupId); // Debug
    res.json({ message: `Fetching messages for group ${groupId}` });
};

// Routes
router.get('/groups', getGroups);
router.post('/groups', createGroup);
router.get('/groups/:group_id/messages', getGroupMessages);

// Route to get user info
router.get('/user-info', (req, res) => {
    if (req.session.userId && req.session.username) {
        res.json({ userId: req.session.userId, username: req.session.username });
    } else {
        res.status(401).send('Niet ingelogd');
    }
});


module.exports = router;
