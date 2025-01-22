const Inquiry = require('../Models/Inquiry');
const User = require('../Models/User')
const { Op } = require('sequelize');
const Invoice = require('../Models/Invoice');
const Quotation = require('../Models/Quotation')
const Revision = require('../Models/Chat')

exports.createInquiry = async (req, res) => {
  try {
    const { 
      companyName, 
      customerName, 
      contactNumber, 
      email, 
      location, 
      requirementDetails, 
      category, 
      salespersonId, 
      price // Added price to destructured request body
    } = req.body;

    console.log(requirementDetails)

    const reasdgasd = [];

    // const tagArray = requirementDetails.map(tag => tag.text);

    // console.log(tagArray)

    // Validate if salespersonId exists and is a salesperson
    const salesperson = await User.findOne({
      where: { id: salespersonId, role: 'salesperson' },
    });

    if (!salesperson) {
      return res.status(400).json({ message: 'Invalid salesperson ID or user is not a salesperson.' });
    }

    // Create the inquiry and associate it with the salesperson
    const inquiry = await Inquiry.create({
      companyName,
      customerName,
      contactNumber,
      email,
      location,
      // requirementDetails: tagArray,
      requirementDetails,
      category,
      price, // Save price in the inquiry
      salespersonId: salesperson.id, // Associate with the salesperson
    });

    res.status(201).json({ message: 'Inquiry created successfully.', inquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating inquiry.', error });
  }
};


exports.getAllInquiriesWithFormattedResponse = async (req, res) => {
  try {
    // Fetch inquiries with associated salesperson
    const inquiries = await Inquiry.findAll( {
      where:{status:'Inquiry Sent'},
      include: {
        model: User,
        attributes: ['name'], // Fetch only the name of the salesperson
        as: 'salesperson',
      },
    });

    // Transform the data into the required format
    const formattedInquiries = inquiries.map(inquiry => {

      if (inquiry.status === 'Inquiry Sent'){
        variant = 'bg-info'
      }else if (inquiry.status==='Quotation generated') {
        variant = 'bg-primary'
      } else if (inquiry.status === 'Quotation Revision'){
        variant = 'bg-warning'
      } else if (inquiry.status === 'Quotation Rejected'){
        variant = 'bg-danger'
      } else if (inquiry.status === 'Quotation Accepted'){
        variant = 'bg-success'
      }  else if (inquiry.status === 'Deployment Done'){
        variant = 'bg-secondary'
      }  else if (inquiry.status === 'Invoice Generated'){
        variant = 'bg-light'
      } else if (inquiry.status === 'Finished Job'){
        variant = 'bg-success'
      }  else if (inquiry.status === 'Cancelled'){
        variant = 'bg-dark'
      }
      


      


    return {
      id:inquiry.id,
      companyName: inquiry.companyName,
      avatar: {
        initial: inquiry.customerName.charAt(0).toUpperCase(),
      },
      name: inquiry.customerName,
      email: inquiry.email,
      status: {
        variant: variant, // Adjust based on your logic
        label: inquiry.status,    // Adjust based on your logic
      },
      SalesPerson: inquiry.salesperson ? inquiry.salesperson.name : "N/A",
      Location: inquiry.location,
      PhoneNumber: inquiry.contactNumber,
      Category: inquiry.category,
      Requirements: inquiry.requirementDetails,
      Price: inquiry.price || "N/A", // Add a default value if Price is not available
      
    };
  });


    res.status(200).json({
      message: "Inquiries retrieved successfully.",
      inquiries: formattedInquiries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving inquiries.", error });
  }
};





exports.updateStatus = async (req, res) => {
  try {
    const { inquiryId, status } = req.body;

    const inquiry = await Inquiry.findByPk(inquiryId);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found.' });

    inquiry.status = status;
    await inquiry.save();

    res.status(200).json({ message: 'Inquiry status updated successfully.', inquiry });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status.', error });
  }
};



//  Dashboard User data 


exports.getSalespersonInquiries = async (req, res) => {
  try {
    // Step 1: Fetch all salespersons
    const salespersons = await User.findAll({
      where: { role: 'salesperson' },
      attributes: ['id', 'name'], // Get salesperson IDs and names
    });

    // Step 2: Initialize data structure
    const labels = [];
    const totalInquiries = [];
    const finishedJobs = [];

    const TotalInquiries = await Inquiry.count() 

    // Step 3: Process each salesperson
    for (const salesperson of salespersons) {
      const { id, name } = salesperson;

      // Count total inquiries associated with the salesperson
      const total = await Inquiry.count({
        where: { salespersonId: id },
      });

      // Count inquiries with status 'Finished Job'
      const finished = await Inquiry.count({
        where: {
          salespersonId: id,
          status: 'Finished Job',
        },
      });

      // Handle cases with no inquiries or finished jobs
      labels.push(name);
      totalInquiries.push(total || 0); // Default to 0 if no inquiries
      finishedJobs.push(finished || 0); // Default to 0 if no finished jobs
    }

    // Step 4: Construct the dataBar object
    const dataBar = {
      labels,
      datasets: [
        {
          data: totalInquiries,
          backgroundColor: '#506fd9',
          barPercentage: 0.45,
        },
        {
          data: finishedJobs,
          backgroundColor: '#85b6ff',
          barPercentage: 0.45,
        },
      ],
    };

  


    // Step 5: Send the response
    res.status(200).json({ success: true, data: dataBar, TotalInquiries:TotalInquiries });
  } catch (error) {
    console.error('Error fetching salesperson inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};



exports.getInquiryStatistics = async (req, res) => {
  try {
    // Define the statuses and their corresponding labels and variants
    const statusLabels = {
      'Quotation Accepted': { name: 'Approved', variant: 'primary' },
      'Quotation generated': { name: 'Pending', variant: 'ui-02' },
      'Quotation Revision': { name: 'Revision', variant: 'gray-700' },
      'Cancelled': { name: 'Canceled', variant: 'gray-500' },
    };

    // Initialize counts with default values of zero
    const statusCounts = Object.fromEntries(
      Object.entries(statusLabels).map(([key, value]) => [value.name, 0])
    );

    // Count inquiries for each status
    let totalInquiries = 0;
    for (const [status, details] of Object.entries(statusLabels)) {
      const count = await Inquiry.count({
        where: { status },
      });
      statusCounts[details.name] = count || 0; // Ensure the count defaults to zero
      totalInquiries += count || 0;
    }

    // Prepare chart data
    const chartLabels = Object.keys(statusCounts);
    const chartData = Object.values(statusCounts);
    const chartResult = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          backgroundColor: ['#506fd9', '#85b6ff', '#50586d', '#b9bdc9'], // Chart colors
        },
      ],
    };

    // Prepare detailed statistics
    const detailedStatistics = Object.entries(statusLabels).map(([status, details]) => {
      const count = statusCounts[details.name];
      const percent = totalInquiries > 0 ? ((count / totalInquiries) * 100).toFixed(2) : 0;
      return {
        name: details.name,
        value: count.toLocaleString(), // Format count as a string with commas
        percent: `${percent}%`,
        progress: parseInt(percent, 10), // Convert percentage to integer for progress
        variant: details.variant,
      };
    });

    // Send both chart and detailed statistics in response
    res.status(200).json({
      success: true,
      chartResult,
      detailedStatistics,
    });
  } catch (error) {
    console.error('Error fetching inquiry statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    // Fetch inquiries with associated salesperson
    const inquiries = await Inquiry.findAll( {
      include: {
        model: User,
        attributes: ['name'], // Fetch only the name of the salesperson
        as: 'salesperson',
      },
    });

    // Transform the data into the required format
    const formattedInquiries = inquiries.map(inquiry => {

      if (inquiry.status === 'Inquiry Sent'){
        variant = 'bg-info'
      }else if (inquiry.status==='Quotation generated') {
        variant = 'bg-primary'
      } else if (inquiry.status === 'Quotation Revision'){
        variant = 'bg-warning'
      } else if (inquiry.status === 'Quotation Rejected'){
        variant = 'bg-danger'
      } else if (inquiry.status === 'Quotation Accepted'){
        variant = 'bg-success'
      }  else if (inquiry.status === 'Deployment Done'){
        variant = 'bg-secondary'
      }  else if (inquiry.status === 'Invoice Generated'){
        variant = 'bg-light'
      } else if (inquiry.status === 'Finished Job'){
        variant = 'bg-success'
      }  else if (inquiry.status === 'Cancelled'){
        variant = 'bg-dark'
      }
      


      return {
        id:inquiry.id,
        CompanyName: inquiry.companyName,
        avatar: {
          initial: inquiry.customerName.charAt(0).toUpperCase(),
        },
        name: inquiry.customerName,
        email: inquiry.email,
        status: {
          variant: variant, 
          label: inquiry.status,    
        },
        SalesPerson: inquiry.salesperson ? inquiry.salesperson.name : "N/A",
        Location: inquiry.location,
        PhoneNumber: inquiry.contactNumber,
        // Category: inquiry.category,
        // Requirements: inquiry.requirementDetails,
        Price: inquiry.price || "N/A", 
        
      };
    });


    res.status(200).json({
      message: "Inquiries retrieved successfully.",
      inquiries: formattedInquiries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving inquiries.", error });
  }
};


exports.getInquiryCountsWithPercentages = async (req, res) => {
  try {
    // Define the statuses and their conditions
    const statuses = {
      TotalActive: {
        condition: { status: { [Op.notIn]: ['Finished Job', 'Cancelled'] } },
      },
      TotalFinishedJobs: {
        condition: { status: 'Finished Job' },
      },
      TotalCancelled: {
        condition: { status: 'Invoice Generated' },
      },
      TotalRevisions: {
        condition: { status: 'Quotation Revision' },
      },
      TotalQuotationsGenerated: {
        condition: { status: 'Quotation generated' },
      },
      TotalDeployment:{
        condition:{status: 'Deployment Done'},
      }
    };

    // Initialize response variables
    let TotalInquiries = 0;
    let TotalActive = 0;
    let TotalFinishedJobs = 0;
    let TotalCancelled = 0;
    let TotalRevisions = 0;
    let TotalQuotationsGenerated = 0;
    let TotalDeployment = 0;

    // Initialize percentage variables
    let TotalActivePercentage = 0;
    let TotalFinishedJobsPercentage = 0;
    let TotalCancelledPercentage = 0;
    let TotalRevisionsPercentage = 0;
    let TotalQuotationsGeneratedPercentage = 0;

    // Fetch total inquiries count
    TotalInquiries = await Inquiry.count();

    // Fetch counts for each category
    for (const [key, value] of Object.entries(statuses)) {
      const count = await Inquiry.count({ where: value.condition });
      if (key === 'TotalActive') TotalActive = count || 0;
      if (key === 'TotalFinishedJobs') TotalFinishedJobs = count || 0;
      if (key === 'TotalCancelled') TotalCancelled = count || 0;
      if (key === 'TotalRevisions') TotalRevisions = count || 0;
      if (key === 'TotalQuotationsGenerated') TotalQuotationsGenerated = count || 0;
      if (key === 'TotalDeployment') TotalDeployment = count || 0;
    }

    // Calculate percentages with rounding to 2 decimal places
    if (TotalInquiries > 0) {
      TotalActivePercentage = ((TotalActive / TotalInquiries) * 100).toFixed(2);
      TotalFinishedJobsPercentage = ((TotalFinishedJobs / TotalInquiries) * 100).toFixed(2);
      TotalCancelledPercentage = ((TotalCancelled / TotalInquiries) * 100).toFixed(2);
      TotalRevisionsPercentage = ((TotalRevisions / TotalInquiries) * 100).toFixed(2);
      TotalQuotationsGeneratedPercentage = ((TotalQuotationsGenerated / TotalInquiries) * 100).toFixed(2);
    }

    // Get the total amount from the Invoice table
    const totalAmountResult = await Invoice.sum('amount',  {
      where: {
        status: 'paid',
      },
    });
    const totalAmount = totalAmountResult || 0; // Default to 0 if no records are found

    // Prepare the result object
    const result = {
      TotalInquiries,
      TotalActive,
      TotalFinishedJobs,
      TotalCancelled,
      TotalRevisions,
      TotalQuotationsGenerated,
      totalAmount, // Include the total amount
      TotalDeployment,
      percentages: {
        TotalActivePercentage,
        TotalFinishedJobsPercentage,
        TotalCancelledPercentage,
        TotalRevisionsPercentage,
        TotalQuotationsGeneratedPercentage,
      },
    };

    // Send the response
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching inquiry counts, percentages, and total amount:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};



// Deployment Done 

// exports.getQuotationsAccepted = async (req, res) => {
//   try {
//     // Fetch inquiries with associated salesperson
//     const inquiries = await Inquiry.findAll( {
//       where:{status:'Quotation Accepted'},
//       include: {
//         model: User,
//         attributes: ['name'], // Fetch only the name of the salesperson
//         as: 'salesperson',
//       },

//     });

//     // Transform the data into the required format
//     const formattedInquiries = inquiries.map(inquiry => {

//       if (inquiry.status === 'Inquiry Sent'){
//         variant = 'bg-info'
//       }else if (inquiry.status==='Quotation generated') {
//         variant = 'bg-primary'
//       } else if (inquiry.status === 'Quotation Revision'){
//         variant = 'bg-warning'
//       } else if (inquiry.status === 'Quotation Rejected'){
//         variant = 'bg-danger'
//       } else if (inquiry.status === 'Quotation Accepted'){
//         variant = 'bg-success'
//       }  else if (inquiry.status === 'Deployment Done'){
//         variant = 'bg-secondary'
//       }  else if (inquiry.status === 'Invoice Generated'){
//         variant = 'bg-light'
//       } else if (inquiry.status === 'Finished Job'){
//         variant = 'bg-success'
//       }  else if (inquiry.status === 'Cancelled'){
//         variant = 'bg-dark'
//       }
      

//     const quotationid = await findOne({
      
//     })
      


//     return {
//       id:inquiry.id,
//       companyName: inquiry.companyName,
//       avatar: {
//         initial: inquiry.customerName.charAt(0).toUpperCase(),
//       },
//       name: inquiry.customerName,
//       email: inquiry.email,
//       status: {
//         variant: variant, // Adjust based on your logic
//         label: inquiry.status,    // Adjust based on your logic
//       },
//       SalesPerson: inquiry.salesperson ? inquiry.salesperson.name : "N/A",
//       Location: inquiry.location,
//       PhoneNumber: inquiry.contactNumber,
//       Category: inquiry.category,
//       Requirements: inquiry.requirementDetails,
      
//       // Price: inquiry.price || "N/A", // Add a default value if Price is not available
      
//     };
//   });


//     res.status(200).json({
//       message: "Inquiries retrieved successfully.",
//       inquiries: formattedInquiries,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error retrieving inquiries.", error });
//   }
// };


exports.getQuotationsAccepted = async (req, res) => {
  try {
    // Step 1: Fetch inquiries with status 'Quotation Accepted'
    const inquiries = await Inquiry.findAll({
      where: { status: 'Quotation Accepted' },
      include: {
        model: User,
        attributes: ['name'], // Fetch only the name of the salesperson
        as: 'salesperson',
      },
    });

    console.log('Fetched inquiries:', inquiries.map((inquiry) => inquiry.id));

    // Step 2: Fetch all quotations for the fetched inquiries
    const inquiryIds = inquiries.map((inquiry) => inquiry.id); // Extract inquiry IDs
    const quotations = await Quotation.findAll({
      where: { inquiryId: inquiryIds }, // Fetch quotations for all inquiries
      order: [['inquiryId', 'ASC'], ['createdAt', 'DESC']], // Sort by inquiryId and createdAt
    });

    console.log('Fetched quotations:', quotations);

    // Step 3: Group quotations by inquiryId to find the latest quotation for each inquiry
    const latestQuotationsMap = quotations.reduce((acc, quotation) => {
      if (!acc[quotation.inquiryId] || acc[quotation.inquiryId].createdAt < quotation.createdAt) {
        acc[quotation.inquiryId] = quotation; // Store the latest quotation for each inquiry
      }
      return acc;
    }, {});

    console.log('Latest quotations map:', latestQuotationsMap);

    // Step 4: Format inquiries with the latest quotation ID
    const formattedInquiries = inquiries.map((inquiry) => {
      const latestQuotation = latestQuotationsMap[inquiry.id]; // Get the latest quotation for this inquiry
      const variant = 'bg-success'; // Since all inquiries are 'Quotation Accepted'

      return {
        id: inquiry.id,
        companyName: inquiry.companyName || 'N/A',
        avatar: {
          initial: inquiry.customerName?.charAt(0)?.toUpperCase() || 'N/A',
        },
        name: inquiry.customerName || 'N/A',
        email: inquiry.email || 'N/A',
        status: {
          variant: variant,
          label: inquiry.status || 'N/A',
        },
        SalesPerson: inquiry.salesperson?.name || 'N/A',
        Location: inquiry.location || 'N/A',
        PhoneNumber: inquiry.contactNumber || 'N/A',
        Category: inquiry.category || 'N/A',
        Requirements: inquiry.requirementDetails || 'N/A',
        latestQuotationId: latestQuotation?.id || 'N/A', // Use optional chaining to avoid errors
      };
    });

    console.log('Formatted inquiries:', formattedInquiries);

    // Step 5: Send the response
    res.status(200).json({
      message: 'Inquiries retrieved successfully.',
      inquiries: formattedInquiries,
    });
  } catch (error) {
    console.error('Error retrieving inquiries:', error);
    res.status(500).json({ message: 'Error retrieving inquiries.', error: error.message });
  }
};

// exports.getRevisionInquiries = async (req, res) => {
//   try {
//     // Step 1: Fetch inquiries with status 'Quotation Accepted'
//     const inquiries = await Inquiry.findAll({
//       where: { status: 'Quotation Revision' },
//       include: {
//         model: User,
//         attributes: ['name'], // Fetch only the name of the salesperson
//         as: 'salesperson',
//       },
//     });

//     console.log('Fetched inquiries:', inquiries.map((inquiry) => inquiry.id));

//     // Step 2: Fetch all quotations for the fetched inquiries
//     const inquiryIds = inquiries.map((inquiry) => inquiry.id); // Extract inquiry IDs
//     const quotations = await Quotation.findAll({
//       where: { inquiryId: inquiryIds }, // Fetch quotations for all inquiries
//       order: [['inquiryId', 'ASC'], ['createdAt', 'DESC']], // Sort by inquiryId and createdAt
//     });

//     console.log('Fetched quotations:', quotations);

//     // Step 3: Group quotations by inquiryId to find the latest quotation for each inquiry
//     const latestQuotationsMap = quotations.reduce((acc, quotation) => {
//       if (!acc[quotation.inquiryId] || acc[quotation.inquiryId].createdAt < quotation.createdAt) {
//         acc[quotation.inquiryId] = quotation; // Store the latest quotation for each inquiry
//       }
//       return acc;
//     }, {});

//     console.log('Latest quotations map:', latestQuotationsMap);

//     // Step 4: Fetch revisions for the latest quotations
//     const revisionIds = Object.values(latestQuotationsMap).map((quotation) => quotation.id);
//     const revisions = await Revision.findAll({
//       where: { quotationId: revisionIds },
//     });

//     console.log('Fetched revisions:', revisions);

//     // Step 5: Format inquiries with the latest quotation ID and revisions
//     const formattedInquiries = inquiries.map((inquiry) => {
//       const latestQuotation = latestQuotationsMap[inquiry.id]; // Get the latest quotation for this inquiry
//       const variant = 'bg-success'; // Since all inquiries are 'Quotation Accepted'
//       const revision = revisions.find((revision) => revision.quotationId === latestQuotation.id);

//       return {
//         id: inquiry.id,
//         companyName: inquiry.companyName || 'N/A',
//         avatar: {
//           initial: inquiry.customerName?.charAt(0)?.toUpperCase() || 'N/A',
//         },
//         name: inquiry.customerName || 'N/A',
//         email: inquiry.email || 'N/A',
//         status: {
//           variant: variant,
//           label: inquiry.status || 'N/A',
//         },
//         SalesPerson: inquiry.salesperson?.name || 'N/A',
//         Location: inquiry.location || 'N/A',
//         PhoneNumber: inquiry.contactNumber || 'N/A',
//         Category: inquiry.category || 'N/A',
//         Requirements: inquiry.requirementDetails || 'N/A',
//         latestQuotationId: latestQuotation?.id || 'N/A', // Use optional chaining to avoid errors
//         revision: revision ? {
//           id: revision.id,
//           quotationId: revision.quotationId,
//           revisionNumber: revision.revisionNumber,
//           revisionDate: revision.revisionDate,
//           revisionDescription: revision.revisionDescription,
//         } : null,
//       };
//     });

//     console.log('Formatted inquiries:', formattedInquiries);

//     // Step 6: Send the response
//     res.status(200).json({
//       message: 'Inquiries retrieved successfully.',
//       inquiries: formattedInquiries,
//     });
//   } catch (error) {
//     console.error('Error retrieving inquiries:', error);
//     res.status(500).json({ message: 'Error retrieving inquiries.', error: error.message });
//   }
// };


exports.getRevisionInquiries = async (req, res) => {
  try {
    // Step 1: Fetch inquiries with status 'Quotation Accepted'
    const inquiries = await Inquiry.findAll({
      where: { status: 'Quotation Revision' },
      include: {
        model: User,
        attributes: ['name'], // Fetch only the name of the salesperson
        as: 'salesperson',
      },
    });

    console.log('Fetched inquiries:', inquiries.map((inquiry) => inquiry.id));

    // Step 2: Fetch all quotations for the fetched inquiries
    const inquiryIds = inquiries.map((inquiry) => inquiry.id); // Extract inquiry IDs
    const quotations = await Quotation.findAll({
      where: { inquiryId: inquiryIds }, // Fetch quotations for all inquiries
      order: [['inquiryId', 'ASC'], ['createdAt', 'DESC']], // Sort by inquiryId and createdAt
    });

    console.log('Fetched quotations:', quotations);

    // Step 3: Group quotations by inquiryId to find the latest quotation for each inquiry
    const latestQuotationsMap = quotations.reduce((acc, quotation) => {
      if (!acc[quotation.inquiryId] || acc[quotation.inquiryId].createdAt < quotation.createdAt) {
        acc[quotation.inquiryId] = quotation; // Store the latest quotation for each inquiry
      }
      return acc;
    }, {});

    console.log('Latest quotations map:', latestQuotationsMap);

    // Step 4: Fetch revisions for the latest quotations
    const revisionIds = Object.values(latestQuotationsMap).map((quotation) => quotation.id);
    const revisions = await Revision.findAll({
      where: { quotationId: revisionIds },
    });

    console.log('Fetched revisions:', revisions);

    // Step 5: Format inquiries with the latest quotation ID and revisions
    const formattedInquiries = inquiries.map((inquiry) => {
      const latestQuotation = latestQuotationsMap[inquiry.id]; // Get the latest quotation for this inquiry
      const variant = 'bg-success'; // Since all inquiries are 'Quotation Accepted'
      const revision = revisions.find((revision) => revision.quotationId === latestQuotation.id);

      return {
        id: inquiry.id,
        companyName: inquiry.companyName || 'N/A',
        avatar: {
          initial: inquiry.customerName?.charAt(0)?.toUpperCase() || 'N/A',
        },
        name: inquiry.customerName || 'N/A',
        email: inquiry.email || 'N/A',
        status: {
          variant: variant,
          label: inquiry.status || 'N/A',
        },
        SalesPerson: inquiry.salesperson?.name || 'N/A',
        Location: inquiry.location || 'N/A',
        PhoneNumber: inquiry.contactNumber || 'N/A',
        Category: inquiry.category || 'N/A',
        Requirements: inquiry.requirementDetails || 'N/A',
        latestQuotationId: latestQuotation?.id || 'N/A', // Use optional chaining to avoid errors
        revision: revision ? {
          id: revision.id,
          quotationId: revision.quotationId,
          comment: revision.comment,
          filePath: revision.filePath,
        } : null,
      };
    });

    console.log('Formatted inquiries:', formattedInquiries);

    // Step 6: Send the response
    res.status(200).json({
      message: 'Inquiries retrieved successfully.',
      inquiries: formattedInquiries,
    });
  } catch (error) {
    console.error('Error retrieving inquiries:', error);
    res.status(500).json({ message: 'Error retrieving inquiries.', error: error.message });
  }
};

// exports.getRevisionInquiries = async (req, res) => {
//   try {
//     // Step 1: Fetch inquiries with status 'Quotation Accepted'
//     const inquiries = await Inquiry.findAll({
//       where: { status: 'Quotation Revision' },
//       include: {
//         model: User,
//         attributes: ['name'], // Fetch only the name of the salesperson
//         as: 'salesperson',
//       },
//     });

//     console.log('Fetched inquiries:', inquiries.map((inquiry) => inquiry.id));

//     // Step 2: Fetch all quotations for the fetched inquiries
//     const inquiryIds = inquiries.map((inquiry) => inquiry.id); // Extract inquiry IDs
//     const quotations = await Quotation.findAll({
//       where: { inquiryId: inquiryIds }, // Fetch quotations for all inquiries
//       order: [['inquiryId', 'ASC'], ['createdAt', 'DESC']], // Sort by inquiryId and createdAt
//     });

//     console.log('Fetched quotations:', quotations);

//     // Step 3: Group quotations by inquiryId to find the latest quotation for each inquiry
//     const latestQuotationsMap = quotations.reduce((acc, quotation) => {
//       if (!acc[quotation.inquiryId] || acc[quotation.inquiryId].createdAt < quotation.createdAt) {
//         acc[quotation.inquiryId] = quotation; // Store the latest quotation for each inquiry
//       }
//       return acc;
//     }, {});

//     console.log('Latest quotations map:', latestQuotationsMap);

//     // Step 4: Format inquiries with the latest quotation ID
//     const formattedInquiries = inquiries.map((inquiry) => {
//       const latestQuotation = latestQuotationsMap[inquiry.id]; // Get the latest quotation for this inquiry
//       const variant = 'bg-success'; // Since all inquiries are 'Quotation Accepted'

//       return {
//         id: inquiry.id,
//         companyName: inquiry.companyName || 'N/A',
//         avatar: {
//           initial: inquiry.customerName?.charAt(0)?.toUpperCase() || 'N/A',
//         },
//         name: inquiry.customerName || 'N/A',
//         email: inquiry.email || 'N/A',
//         status: {
//           variant: variant,
//           label: inquiry.status || 'N/A',
//         },
//         SalesPerson: inquiry.salesperson?.name || 'N/A',
//         Location: inquiry.location || 'N/A',
//         PhoneNumber: inquiry.contactNumber || 'N/A',
//         Category: inquiry.category || 'N/A',
//         Requirements: inquiry.requirementDetails || 'N/A',
//         latestQuotationId: latestQuotation?.id || 'N/A', // Use optional chaining to avoid errors
//       };
//     });

//     console.log('Formatted inquiries:', formattedInquiries);

//     // Step 5: Send the response
//     res.status(200).json({
//       message: 'Inquiries retrieved successfully.',
//       inquiries: formattedInquiries,
//     });
//   } catch (error) {
//     console.error('Error retrieving inquiries:', error);
//     res.status(500).json({ message: 'Error retrieving inquiries.', error: error.message });
//   }
// };