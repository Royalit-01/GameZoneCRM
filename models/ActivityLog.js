// models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  employee: { type: String, required: true }, // e.g., username
  action: { type: String, required: true },   // e.g., 'create_order'
  details: { type: Object },                  // any extra info like orderId, duration
  store: { type: String, required: true },    // 'Store 1' or 'Store 2'
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now},
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);