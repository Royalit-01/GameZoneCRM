// Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  isWalkIn: { type: Boolean, default: false }, // true for café-only customers
});

module.exports = mongoose.model('Customer', customerSchema);
