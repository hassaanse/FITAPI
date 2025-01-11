const Invoice = require('../Models/Invoice');

exports.createInvoice = async (req, res) => {
  try {
    const { quotationId, invoiceNumber, amount, paymentMethod } = req.body;

    const invoice = await Invoice.create({
      quotationId,
      invoiceNumber,
      amount,
      paymentMethod,
    });

    res.status(201).json({ message: 'Invoice created successfully.', invoice });
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice.', error });
  }
};

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
