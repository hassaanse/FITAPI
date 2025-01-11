const express = require('express');
const { createQuotation, updateQuotationStatus } = require('../Controllers/quotationController');

const router = express.Router();

// Create a quotation
router.post('/create', createQuotation);

// Update quotation status
router.patch('/status', updateQuotationStatus);

module.exports = router;
