const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const User = require('./Models/User');
const Inquiry = require('./Models/Inquiry');
const Quotation = require('./Models/Quotation');
const Invoice = require('./Models/Invoice');
const Chat = require('./Models/Chat');
// const Revision = require('./Models/');
const Revision = require('./Models/Chat');


const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's origin
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Middleware
app.use(express.json());

// Associations
User.hasMany(Inquiry, { foreignKey: 'salespersonId', as: 'inquiries' });
Inquiry.belongsTo(User, { foreignKey: 'salespersonId', as: 'salesperson' });

Inquiry.hasOne(Quotation, { foreignKey: 'inquiryId' });
Quotation.belongsTo(Inquiry, { foreignKey: 'inquiryId' });

Quotation.hasOne(Invoice, { foreignKey: 'quotationId' });
Invoice.belongsTo(Quotation, { foreignKey: 'quotationId' });

Inquiry.hasMany(Chat, { foreignKey: 'inquiryId' });
Chat.belongsTo(Inquiry, { foreignKey: 'inquiryId' });

// Quotation model
Quotation.hasMany(Revision, { foreignKey: "quotationId" });
Revision.belongsTo(Quotation, { foreignKey: "quotationId" });


// Routes
const authRoutes = require('./Routers/authRouter');
const inquiryRoutes = require('./Routers/inquiryRoutes');
const quotationRoutes = require('./Routers/quotationRoutes');
const invoiceRoutes = require('./Routers/invoiceRoutes');
const chatRoutes = require('./Routers/chatRoutes');
const revisionRoutes = require('./Routers/RevisionRouter');

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/Revisions' , revisionRoutes);

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Server
const PORT = process.env.PORT || 5000;

// {force:true}

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Connection not established:', err);
  });
