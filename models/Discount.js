const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true, // e.g., "14:00"
    match: /^([0-1]\d|2[0-3]):([0-5]\d)$/,
  },
  endTime: {
    type: String,
    required: true, // e.g., "18:00"
    match: /^([0-1]\d|2[0-3]):([0-5]\d)$/,
  },
  discountType: {
    type: String,
    enum: ['percent', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  store: {
    type: Number,
    required: true,
  },

}, {
  timestamps: true
});

module.exports = mongoose.model('Discount', discountSchema);
