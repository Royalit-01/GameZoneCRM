const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4().toUpperCase(),
  },
  // customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default : '64efabc1234567890abcde12' },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  screenNumber: { type: String, default: "Walk In" }, // e.g., "Screen 5"; optional for walk-ins
  items: [
    {
      snackName: { type: String, required: true, default: "snackName" },
      snackQuantity: { type: Number, required: true, default: "3" },
      snackPrice: { type: Number, required: true, default: "199" },
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Cooking", "Prepared", "Cancelled"],
    default: "Pending",
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  cancelMessage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
