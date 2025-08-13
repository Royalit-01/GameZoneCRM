const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  store: {
    type: Number,
    required: true,
  },
  discountType: {
    type: String,
    enum: ["flat", "percentage"],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  freeSnacks: {
    type: [
      {
        snackName: { type: String, required: true },
        snackQuantity: { type: Number, required: true },
        snackPrice: { type: Number, required: true },
      },
    ],
    default: [],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Prevent OverwriteModelError
module.exports =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
