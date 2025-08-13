// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  screenId: {
    type: String,
    required: true,
    enum: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'Pool'],
  },
  store: { type: Number, required: true }, // Store identifier

  inTime: {
    type: Date,
    default: null,
  },
  outTime: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 🔄 Virtual status field
bookingSchema.virtual('status').get(function () {
  if (!this.inTime || !this.outTime) return 'available';

  const now = new Date();
  const start = new Date(this.inTime);
  const end = new Date(this.outTime);

  if (now >= start && now <= end) return 'active';
  if (now < start) return 'upcoming';
  if (now > end) return 'expired';

  return 'available';
});

module.exports = mongoose.model('Booking', bookingSchema);
