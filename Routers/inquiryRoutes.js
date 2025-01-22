const express = require('express');
const inquiryController= require('../Controllers/inquiryController');

const router = express.Router();

// Create an inquiry
router.post('/create', inquiryController.createInquiry);

router.get('/getAllInquiry', inquiryController.getAllInquiriesWithFormattedResponse);

// Update inquiry status
router.patch('/status', inquiryController.updateStatus);


// Dashboard
router.get('/EmployeePerfomance' , inquiryController.getSalespersonInquiries );

router.get('/PieChartData', inquiryController.getInquiryStatistics);

router.get('/DashboardInquiries', inquiryController.getAllInquiries);

router.get('/TotalInquiries' , inquiryController.getInquiryCountsWithPercentages);

// router.get('/R')


// Deployment


router.get('/Deployment', inquiryController.getQuotationsAccepted);


// Revision

router.get('/RevisionQuotations', inquiryController.getRevisionInquiries);

module.exports = router;

