const express = require('express');
const router = express.Router();
const { getGroups, createGroup, getGroupMessages,  } = require('../controllers/groupControllers');

// Routes voor groepen
router.get('/groups', getGroups);
router.post('/groups', createGroup);
router.get('/groups/:group_id/messages', getGroupMessages);

module.exports = router;
