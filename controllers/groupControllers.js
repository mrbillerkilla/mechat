
const express = require('express');
const { getGroups, createGroup, getGroupMessages, saveGroupMessage } = require('../controllers/groupController');
const router = express.Router();

// Routes voor groepen
router.get('/api/groups', getGroups);
router.post('/api/groups', createGroup);
router.get('/api/group-messages/:group_id', getGroupMessages);
router.post('/api/group-messages', saveGroupMessage);

module.exports = router;
