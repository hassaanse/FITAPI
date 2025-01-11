const Quotation = require('../Models/Quotation');

exports.createQuotation = async (req, res) => {
  try {
    const { inquiryId, quotationDetails, amount } = req.body;

    const quotation = await Quotation.create({
      inquiryId,
      quotationDetails,
      amount,
    });

    res.status(201).json({ message: 'Quotation created successfully.', quotation });
  } catch (error) {
    res.status(500).json({ message: 'Error creating quotation.', error });
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
