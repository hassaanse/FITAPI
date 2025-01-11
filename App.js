const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./Routers');
const sequelize = require('./config/database')
const cors = require('cors');
require('dotenv').config();


// const { User, Inquiry, Quotation, Invoice, Chat } = require('./Models'); 
// Import models

const User = require('./Models/User')
const Inquiry = require('./Models/Inquiry')
const Quotation = require('./Models/Quotation')
const Invoice = require('./Models/Invoice')
const Chat = require('./Models/Chat')

const app = express();

// Middleware
app.use(express.json());

// Associations
User.hasMany(Inquiry, { foreignKey: 'salespersonId' });
Inquiry.belongsTo(User, { foreignKey: 'salespersonId' });

Inquiry.hasMany(Quotation, { foreignKey: 'inquiryId' });
Quotation.belongsTo(Inquiry, { foreignKey: 'inquiryId' });

Quotation.hasOne(Invoice, { foreignKey: 'quotationId' });
Invoice.belongsTo(Quotation, { foreignKey: 'quotationId' });

Inquiry.hasMany(Chat, { foreignKey: 'inquiryId' });
Chat.belongsTo(Inquiry, { foreignKey: 'inquiryId' });
// const sequelize  =



// Routes
const authRoutes = require('./Routers/authRouter');
const inquiryRoutes = require('./Routers/inquiryRoutes');
const quotationRoutes = require('./Routers/quotationRoutes');
const invoiceRoutes = require('./Routers/invoiceRoutes');
const chatRoutes = require('./Routers/chatRoutes');

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/chats', chatRoutes);



// const app = express();
const PORT = process.env.PORT || 80;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', routes);

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});


app.use(cors({ origin: 'http://localhost:3000' })); 

app.use((req, res, next) => {
  console.log(`${req.method} request received at ${req.url}`);
  next();
});

// Server
sequelize
  .sync()
  .then((result) => {
    // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Connection not established:', err);
  });




// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
