const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: Number },                     // Phone number
  password: { type: String, required: true },
  adhar: { type: String, required: true },      // Aadhaar number added
  role: { type: String, default: 'staff' },
  store: { type: Number, default: 0 }
}, { timestamps: true });

// Optional: Password hash middleware
// staffSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// Optional: Compare password method
// staffSchema.methods.comparePassword = function(candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
