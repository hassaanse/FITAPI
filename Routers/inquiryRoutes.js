const express = require('express');
const { createInquiry, updateStatus } = require('../Controllers/inquiryController');

const router = express.Router();

// Create an inquiry
router.post('/create', createInquiry);

// Update inquiry status
router.patch('/status', updateStatus);

module.exports = router;
