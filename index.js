const express = require('express');
const authRouter = require('./router/authrouter');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./db/db');
const app = express();

// Use the PORT environment variable if available, otherwise default to 3000
const PORT = process.env.PORT || 5000;

app.use(cors());

// Connect to the MongoDB database
connectDB();

// Middleware to parse incoming JSON requests
// This is crucial for your API to be able to read data sent from your React front-end
app.use(express.json());

// A basic root route to check if the server is up and running
app.get('/', (req, res) => {
  res.send('Welcome to the GameZone CRM Backend!');
});

app.use('/api/auth', authRouter);
app.use('/api/customers', require('./router/customerRouter'));
app.use('/api/ledgers', require('./router/ledgerRouter')); 
app.use('/api/admin', require('./router/adminRoute'));
app.use('/api/admin/discounts', require('./router/discountRoutes'));
app.use('/api/orders', require('./router/orderRoutes'));
app.use('/api/admindashboard',require('./router/AdminDashboardRoute'))

// Start the server and listen for incoming requests on the specified portt
app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});