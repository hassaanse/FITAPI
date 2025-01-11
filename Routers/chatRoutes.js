const express = require('express');
const { sendMessage, getMessages } = require('../Controllers/chatController');

const router = express.Router();

// Send a message
router.post('/send', sendMessage);

// Get all messages for an inquiry
router.get('/:inquiryId', getMessages);

module.exports = router;
