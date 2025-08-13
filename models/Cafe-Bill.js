// Bill.js
const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  printed: { type: Boolean, default: false },
  formatSize: { type: String, default: '3x3' }, // for thermal print
  qrCodeOrGST: { type: String } // optional field
});

module.exports = mongoose.model('Bill', billSchema);
