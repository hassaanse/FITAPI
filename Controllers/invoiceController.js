const Invoice = require('../Models/Invoice');
const Quotation = require('../Models/Quotation')
const Inquiry = require('../Models/Inquiry')

const fs = require('fs');
const path = require('path');

const User = require('../Models/User');

// exports.createInvoice = async (req, res) => {
//   try {
//     const { quotationId, invoiceNumber, amount, paymentMethod } = req.body;

//     // Step 1: Check if the quotation exists
//     const quotation = await Quotation.findOne({
//       where: { id: quotationId },
//     });

//     if (!quotation) {
//       return res.status(404).json({ message: 'Quotation not found.' });
//     }

//     // Step 2: Check if an invoice already exists for the inquiry
//     const existingInvoice = await Invoice.findOne({
//       where: { quotationId },
//     });

//     if (existingInvoice) {
//       return res.status(400).json({ message: 'Invoice already exists for this inquiry.' });
//     }

//     // Step 3: Update the inquiry status
//     const inquiry = await Inquiry.findOne({
//       where: { id: quotation.inquiryId },
//     });

//     if (!inquiry) {
//       return res.status(404).json({ message: 'Inquiry not found.' });
//     }

//     inquiry.status = 'Invoice Generated';
//     await inquiry.save();

//     // Step 4: Create the invoice
//     const invoice = await Invoice.create({
//       quotationId,
//       invoiceNumber,
//       amount,
//       paymentMethod,
//       status: paymentMethod === 'cash' ? 'Paid' : 'Pending', // Set status based on payment method
//     });

//     res.status(201).json({ message: 'Invoice created successfully.', invoice });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error creating invoice.', error });
//   }
// };


// exports.createInvoice = async (req, res) => {
//   try {
//     const { quotationId, invoiceNumber, amount, paymentMethod } = req.body;

//     // Check if a file is uploaded
//     if (!req.file) {
//       return res.status(400).json({ message: 'PDF file is required.' });
//     }

//     const fullPath = req.file.path; // Path to the uploaded PDF

//     const uploadDirectory = 'uploads';
//     const relativePathIndex = fullPath.indexOf(uploadDirectory);
//     const filePath = fullPath.substring(relativePathIndex);

//     // Step 1: Check if the quotation exists
//     const quotation = await Quotation.findOne({
//       where: { id: quotationId },
//     });

//     if (!quotation) {
//       return res.status(404).json({ message: 'Quotation not found.' });
//     }

//     // Step 2: Check if an invoice already exists for the inquiry
//     const existingInvoice = await Invoice.findOne({
//       where: { quotationId },
//     });

//     if (existingInvoice) {
//       return res.status(400).json({ message: 'Invoice already exists for this inquiry.' });
//     }

//     // Step 3: Update the inquiry status
//     const inquiry = await Inquiry.findOne({
//       where: { id: quotation.inquiryId },
//     });

//     if (!inquiry) {
//       return res.status(404).json({ message: 'Inquiry not found.' });
//     }

//     inquiry.status = 'Invoice Generated';
//     await inquiry.save();

//     // Step 4: Create the invoice
//     const invoice = await Invoice.create({
//       quotationId,
//       invoiceNumber,
//       amount,
//       paymentMethod,
//       filePath,
//       status: paymentMethod === 'cash' ? 'Paid' : 'Pending', // Set status based on payment method
//     });

//     res.status(201).json({ message: 'Invoice created successfully.', invoice });
//   } catch (error) {
//     console.error(error);
//     // If the file is uploaded but there’s an error, delete the uploaded file
//     if (req.file) {
//       fs.unlinkSync(req.file.path);
//     }
//     res.status(500).json({ message: 'Error creating invoice.', error: error.message });
//   }
// };

const checkAndUpdateInvoiceStatus = async () => {
  try {
    console.log('Checking and updating invoice status...');

    // Get all invoices with status "Credit"
    const invoices = await Invoice.findAll({
      where: { status: 'Credit' },
    });

    const today = new Date();

    for (const invoice of invoices) {
      const invoiceDate = new Date(invoice.date);

      // If the invoice date has passed, update the status to "Paid"
      if (today >= invoiceDate) {
        invoice.status = 'Paid';
        await invoice.save();

        // Update the associated inquiry status to "Finished Job"
        const quotation = await Quotation.findOne({
          where: { id: invoice.quotationId },
        });

        if (quotation) {
          const inquiry = await Inquiry.findOne({
            where: { id: quotation.inquiryId },
          });

          if (inquiry) {
            inquiry.status = 'Finished Job';
            await inquiry.save();
          }
        }

        console.log(`Invoice ${invoice.id} updated to "Paid".`);
      }
    }
  } catch (error) {
    console.error('Error updating invoice status:', error);
  }
};

// Schedule the function to run every hour
const intervalId = setInterval(checkAndUpdateInvoiceStatus, 60 * 60 * 1000); // 1 hour interval

// Optional: Stop the interval after a certain condition
// clearInterval(intervalId);

// API to create an invoice
exports.createInvoice = async (req, res) => {
  try {
    const { quotationId, invoiceNumber, amount, paymentMethod, date } = req.body;

    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required.' });
    }

    const fullPath = req.file.path; // Path to the uploaded PDF

    const uploadDirectory = 'uploads';
    const relativePathIndex = fullPath.indexOf(uploadDirectory);
    const filePath = fullPath.substring(relativePathIndex);

    // Step 1: Check if the quotation exists
    const quotation = await Quotation.findOne({
      where: { id: quotationId },
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    // Step 2: Check if an invoice already exists for the inquiry
    const existingInvoice = await Invoice.findOne({
      where: { quotationId },
    });

    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice already exists for this inquiry.' });
    }

    // Step 3: Update the inquiry status
    const inquiry = await Inquiry.findOne({
      where: { id: quotation.inquiryId },
    });

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    console.log(date)
    // Check if the date has passed
    const today = new Date();
    const invoiceDate = new Date(date);

    console.log(invoiceDate)



   
    // Step 4: Create the invoice
    const invoice = await Invoice.create({
      quotationId,
      invoiceNumber,
      amount,
      paymentMethod,
      filePath,
      date,
      status: paymentMethod === 'cash' ? 'Paid' : 'Credit', // Set status based on payment method
    });
    
    invoice.save();

    if(invoice.save){


      if (today >= invoiceDate) {
        inquiry.status = 'Finished Job';
      } else {
        inquiry.status = 'Invoice Generated';
      }
  
      await inquiry.save();
  


    }

    res.status(201).json({ message: 'Invoice created successfully.', invoice });
  } catch (error) {
    console.error(error);
    // If the file is uploaded but there’s an error, delete the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error creating invoice.', error: error.message });
  }
};



// exports.createInvoice = async (req, res) => {
//   try {
//     const { quotationId, invoiceNumber, amount, paymentMethod, date } = req.body;

//     // Check if a file is uploaded
//     if (!req.file) {
//       return res.status(400).json({ message: 'PDF file is required.' });
//     }

//     const fullPath = req.file.path; // Path to the uploaded PDF

//     const uploadDirectory = 'uploads';
//     const relativePathIndex = fullPath.indexOf(uploadDirectory);
//     const filePath = fullPath.substring(relativePathIndex);

//     // Step 1: Check if the quotation exists
//     const quotation = await Quotation.findOne({
//       where: { id: quotationId },
//     });

//     if (!quotation) {
//       return res.status(404).json({ message: 'Quotation not found.' });
//     }

//     // Step 2: Check if an invoice already exists for the inquiry
//     const existingInvoice = await Invoice.findOne({
//       where: { quotationId },
//     });

//     if (existingInvoice) {
//       return res.status(400).json({ message: 'Invoice already exists for this inquiry.' });
//     }

//     // Step 3: Update the inquiry status
//     const inquiry = await Inquiry.findOne({
//       where: { id: quotation.inquiryId },
//     });

//     if (!inquiry) {
//       return res.status(404).json({ message: 'Inquiry not found.' });
//     }

//     // Check if the date has passed
//     const today = new Date();
//     const invoiceDate = new Date(date);

//     if (today >= invoiceDate) {
//       inquiry.status = 'Finished Job';
//     } else {
//       inquiry.status = 'Invoice Generated';
//     }

//     await inquiry.save();

//     // Step 4: Create the invoice
//     const invoice = await Invoice.create({
//       quotationId,
//       invoiceNumber,
//       amount,
//       paymentMethod,
//       filePath,
//       date,
//       status: paymentMethod === 'cash' ? 'Paid' : 'Credit', // Set status based on payment method
//     });

//     res.status(201).json({ message: 'Invoice created successfully.', invoice });
//   } catch (error) {
//     console.error(error);
//     // If the file is uploaded but there’s an error, delete the uploaded file
//     if (req.file) {
//       fs.unlinkSync(req.file.path);
//     }
//     res.status(500).json({ message: 'Error creating invoice.', error: error.message });
//   }
// };


exports.updatePaymentStatus = async (req, res) => {
  try {
    const { invoiceId, status } = req.body;

    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });

    invoice.status = status;
    await invoice.save();

    res.status(200).json({ message: 'Invoice payment status updated.', invoice });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status.', error });
  }
};


exports.InvoiceQuotationDetails = async (req, res) => {
  try {
    // Fetch inquiries with status 'Quotation generated'
    const inquiries = await Inquiry.findAll({
      where: { status: 'Deployment Done' },
      attributes: [
        'id',
        'companyName',
        'customerName',
        'email',
        'contactNumber',
        'status',
        'location',
        'category',
        'requirementDetails',
        'price',
      ],
      include: [
        {
          model: Quotation,
          attributes: ['id', 'quotationName', 'filePath'],
          required: true,
        },
        {
          model: User,
          attributes: ['name'],
          as: 'salesperson',
        },
      ],
    });

    // Define the status variants
    const statusVariants = {
      'Inquiry Sent': 'bg-info',
      'Quotation generated': 'bg-primary',
      'Quotation Revision': 'bg-warning',
      'Quotation Rejected': 'bg-danger',
      'Quotation Accepted': 'bg-success',
      'Deployment Done': 'bg-secondary',
      'Invoice Generated': 'bg-light',
      'Finished Job': 'bg-success',
      'Cancelled': 'bg-dark',
    };

    // Transform the data into the required format
    const formattedInquiries = inquiries.map((inquiry) => {
      // Set the variant based on the inquiry status
      const variant = statusVariants[inquiry.status] || 'bg-secondary';

      // Set the avatar as the initial letter of the customer's name
      const avatar = {
        initial: inquiry.customerName?.charAt(0)?.toUpperCase() || 'N/A',
      };

      return {
        id: inquiry.id,
        companyName: inquiry.companyName || 'N/A',
        avatar: avatar,
        name: inquiry.customerName || 'N/A',
        email: inquiry.email || 'N/A',
        status: {
          variant: variant,
          label: inquiry.status || 'N/A',
        },
        SalesPerson: inquiry.salesperson ? inquiry.salesperson.name : 'N/A',
        Location: inquiry.location || 'N/A',
        PhoneNumber: inquiry.contactNumber || 'N/A',
        Category: inquiry.category || 'N/A',
        Requirements: inquiry.requirementDetails || 'N/A',
        Price: inquiry.price || 'N/A',
        Quotation: {
          id: inquiry.Quotation.id,
          quotationName: inquiry.Quotation.quotationName,
          filePath: inquiry.Quotation.filePath,
        },
      };
    });

    // Send the response
    res.status(200).json({
      message: 'Inquiry details retrieved successfully.',
      data: formattedInquiries,
    });
  } catch (error) {
    console.error('Error fetching inquiry details:', error);
    res.status(500).json({ error: 'An error occurred while fetching inquiry details.' });
  }
};
