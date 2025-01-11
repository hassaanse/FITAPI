const express = require('express');
const { createInvoice, updatePaymentStatus } = require('../Controllers/invoiceController');

const router = express.Router();

// Create an invoice
router.post('/create', createInvoice);

// Update payment status
router.patch('/payment-status', updatePaymentStatus);

module.exports = router;
