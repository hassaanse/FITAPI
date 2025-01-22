// const express = require('express');
// const quotationController = require('../Controllers/quotationController');

// const router = express.Router();

// // Create a quotation
// router.post('/create', quotationController.createQuotation);

// // Update quotation status
// router.patch('/status', quotationController.updateQuotationStatus);

// module.exports = router;

// router.get('/inquiryDetails',  quotationController.inquiryDetails)


const express = require('express');
const quotationController = require('../Controllers/quotationController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../uploads/quotations');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

const router = express.Router();

// Create a quotation with file upload
router.post(
  '/create',
  upload.single('file'), // Multer middleware for handling the file upload
  quotationController.createQuotation
);

// Update quotation status
router.patch('/status', quotationController.updateQuotationStatus);

// Get inquiry details
router.get('/inquiryDetails', quotationController.inquiryDetails);

module.exports = router;


// Create a quotation with file upload
router.post(
  '/create',
  upload.single('file'), // Multer middleware for handling the file upload
  quotationController.createQuotation
);

// Update quotation status
router.patch('/status', quotationController.updateQuotationStatus);

router.post('/UpdateQuotation', quotationController.updateQuotation);



// Get inquiry details
router.get('/inquiryDetails', quotationController.inquiryDetails);

// Accept Quotation

router.post('/AcceptQuotation', quotationController.postQuotationAccepted);


// Deployment Done

router.post('/DeploymentDone', quotationController.postDeploymentDone);


module.exports = router;
