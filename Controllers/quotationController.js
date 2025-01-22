const Quotation = require('../Models/Quotation');
const Inquiry = require('../Models/Inquiry')
const fs = require('fs');
const path = require('path');
const User = require('../Models/User');
const { where } = require('sequelize');

// exports.createQuotation = async (req, res) => {
//   try {
//     const { inquiryId, quotationDetails, amount } = req.body;
//     console.log(inquiryId + '    ' +  quotationDetails + '      ' + amount)

//     const quotation = await Quotation.create({
//       inquiryId,
//       quotationDetails,
//       amount,
//     });

//     res.status(201).json({ message: 'Quotation created successfully.', quotation });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating quotation.', error });
//   }
// };

exports.createQuotation = async (req, res) => {
  try {
    const { quotationName, inquiryId } = req.body;

    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required.' });
    }

    
    const fullPath  = req.file.path; // Path to the uploaded PDF

    const uploadDirectory = 'uploads';
    const relativePathIndex = fullPath.indexOf(uploadDirectory);
    const filePath = fullPath.substring(relativePathIndex);

    console.log(filePath)

    // const filePath = req.file.path; // Path to the uploaded PDF

    // Create the quotation record in the database
    const quotation = await Quotation.create({
      quotationName,
      inquiryId,  // Save the inquiryId as well
      filePath,
    });

    const status = "Quotation generated";
    const inquiry = await Inquiry.findByPk(inquiryId);

    inquiry.status = status;

    await inquiry.save();

    res.status(201).json({
      message: 'Quotation created successfully.',
      quotation: {
        id: quotation.id,
        quotationName: quotation.quotationName,
        inquiryId: quotation.inquiryId,  // Include inquiryId in the response
        filePath: quotation.filePath,
      },
    });
  } catch (error) {
    console.error('Error creating quotation:', error);

    // If the file is uploaded but there’s an error, delete the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: 'Error creating quotation.', error: error.message });
  }
};

exports.handler =   async (req, res) => {
  if (req.method === 'GET') {
    try {
      
      const quotations = await Quotation.findAll();

      // Respond with the fetched data
      return res.status(200).json({
        success: true,
        data: quotations,
      });
    } catch (error) {
      console.error('Error fetching quotations:', error);

      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  } else {

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    });
  }
}


exports.updateQuotation = async (req, res) => {
  try {
    const { quotationId, quotationName } = req.body;



    // Check if a file is uploaded
    if (req.file) {
      const fullPath = req.file.path; // Path to the uploaded PDF

      const uploadDirectory = 'uploads';
      const relativePathIndex = fullPath.indexOf(uploadDirectory);
      const filePath = fullPath.substring(relativePathIndex);

      console.log(quotationId,quotationName,filePath)

      // Update the quotation record in the database
      const quotation = await Quotation.findByPk(quotationId);

      if (!quotation) {
        return res.status(404).json({ message: 'Quotation not found.' });
      }

      // Delete the old file if a new file is uploaded
      if (quotation.filePath) {
        fs.unlinkSync(quotation.filePath);
      }



      quotation.quotationName = quotationName;
      quotation.filePath = filePath;

      await quotation.save();
    } else {
      // Update the quotation record in the database
      const quotation = await Quotation.findByPk(quotationId);

      if (!quotation) {
        return res.status(404).json({ message: 'Quotation not found.' });
      }

      quotation.quotationName = quotationName;

      await quotation.save();
    }

    res.status(200).json({
      message: 'Quotation updated successfully.',
      
    });
  } catch (error) {
    console.error('Error updating quotation:', error);

    // If the file is uploaded but there’s an error, delete the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: 'Error updating quotation.', error: error.message });
  }
};

exports.updateQuotationStatus = async (req, res) => {
  try {
    const { quotationId, status } = req.body;

    const quotation = await Quotation.findByPk(quotationId);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found.' });

    quotation.status = status;
    await quotation.save();

    res.status(200).json({ message: 'Quotation status updated successfully.', quotation });
  } catch (error) {
    res.status(500).json({ message: 'Error updating quotation status.', error });
  }
};


exports.inquiryDetails = async (req, res) => {
  try {
    // Fetch inquiries with status 'Quotation generated'
    const inquiries = await Inquiry.findAll({
      where: { status: 'Quotation generated' },
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



exports.postQuotationAccepted = async (req,res) =>{

  try {
     
    const Id = req.body.quotationId

    const quotations = await Quotation.findOne({
      where: {
        id: Id
      }
    })


    const inquiry = await Inquiry.findOne({
      where:{
        id: quotations.inquiryId
      }
    })

    const new_status = 'Quotation Accepted'

    inquiry.status = new_status;


    inquiry.save()

    return res.status(200).json({ inquiry });


  } catch (error) {
    console.error('Error Accepting Quotation:', error);
    return res.status(500).json({ error: 'An error occurred while Accepting Quotation.' });
  }

}


exports.postDeploymentDone = async (req,res) =>{

  try {
     
    const Id = req.body.quotationId

    const quotations = await Quotation.findOne({
      where: {
        id: Id
      }
    })


    const inquiry = await Inquiry.findOne({
      where:{
        id: quotations.inquiryId
      }
    })

    const new_status = 'Deployment Done'

    inquiry.status = new_status;


    inquiry.save()

    return res.status(200).json({ inquiry });


  } catch (error) {
    console.error('Error Accepting Quotation:', error);
    return res.status(500).json({ error: 'An error occurred while Accepting Quotation.' });
  }

}



exports.postDeploymentDone = async (req,res) =>{

  try {
     
    const Id = req.body.quotationId

    const quotations = await Quotation.findOne({
      where: {
        id: Id
      }
    })


    const inquiry = await Inquiry.findOne({
      where:{
        id: quotations.inquiryId
      }
    })

    const new_status = 'Deployment Done'

    inquiry.status = new_status;


    inquiry.save()

    return res.status(200).json({ inquiry });


  } catch (error) {
    console.error('Error Accepting Quotation:', error);
    return res.status(500).json({ error: 'An error occurred while Accepting Quotation.' });
  }

}





