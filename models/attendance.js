const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String, // e.g. '2025-07-16'
    required: true
  },
  time: {
    type: String, // optional, e.g. '09:00'
    default: null
  },
  records: [
    {
      name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      store: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ['present', 'absent', 'half-day'],
        required: true
      }
    }
  ]
}, {
  timestamps: true
});

// You can use a compound index to ensure unique date + optional time
attendanceSchema.index({ date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
