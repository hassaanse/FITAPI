const express = require("express");
const router = express.Router();
const Quotation = require("../Models/Quotation");
const Revision = require("../Models/Chat"); // Corrected import for Revision
const Inquiry = require('../Models/Inquiry')

router.post("/create", async (req, res) => {
  try {
    const { quotationId, comment } = req.body;
    
    if (!quotationId || !comment) {
      return res.status(400).json({ message: "Quotation ID and comment are required." });
    }
    console.log(quotationId, comment);
    
    // Find the quotation by primary key (id) using find() method
    const quotation = await Quotation.findByPk(quotationId);

    const inqury = await Inquiry.findByPk(quotation.inquiryId)

    const  newStatus = 'Quotation Revision'

    inqury.status = newStatus;

    inqury.save()

    console.log(quotation)

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found." });
    }
    
    // Create a new revision and include the filePath of the quotation
    const newRevision = await Revision.create({
      quotationId,
      comment,
      filePath: quotation.filePath, // Copy the filePath from the Quotation
    });
    
    res.status(201).json(newRevision);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating revision", error });
  }
});






module.exports = router;
