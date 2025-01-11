const Inquiry = require('../Models/Inquiry');

exports.createInquiry = async (req, res) => {
  try {
    const { companyName, customerName, contactNumber, email, location, requirementDetails, category } = req.body;

    const inquiry = await Inquiry.create({
      companyName,
      customerName,
      contactNumber,
      email,
      location,
      requirementDetails,
      category,
    });

    res.status(201).json({ message: 'Inquiry created successfully.', inquiry });
  } catch (error) {
    res.status(500).json({ message: 'Error creating inquiry.', error });
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
