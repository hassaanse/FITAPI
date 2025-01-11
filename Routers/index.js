const express = require('express');

const authRoutes = require('./authRouter');
const inquiryRoutes = require('./inquiryRoutes');
const quotationRoutes = require('./quotationRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const chatRoutes = require('./chatRoutes');

const router = express.Router();

// Authentication routes
router.use('/auth', authRoutes);

// Inquiry routes
router.use('/inquiries', inquiryRoutes);

// Quotation routes
router.use('/quotations', quotationRoutes);

// Invoice routes
router.use('/invoices', invoiceRoutes);

// Chat routes
router.use('/chats', chatRoutes);

module.exports = router;
