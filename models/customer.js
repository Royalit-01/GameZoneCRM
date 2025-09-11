const mongoose = require("mongoose");


const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  created_at: { type: Date, default: Date.now },
  store: { type: Number, required: true }, // Store identifier
  discount: { type: String, default: "not available" }, // Discount field
  screen: { type: String },
  game: { type: String }, // Game being played
  duration: { type: Number }, // In minutes or hours
  snacks: { type: Number, default: 0 }, // Price of snacks
  drink: { type: Number, default: 0 }, // Price of drinks
  paid: { type: Number, default: 0 },
  nonPlayingMembers: { type: Number, default: 0 }, // Count of non-playing members
  total_amount: { type: Number, default: 0 },
  payment: { type: String, default: "Cash" }, // Payment method
  players: { type: Number, default: 1 }, // Number of players in the booking
  wallet: { type: Number, default: 0 }, // Customer's wallet balance
  status: { type: String, default: "active" }, // Customer status
  store: { type: Number, default: 0 }, // Customer's store
  extended_amount: { type: Number, default: 0 },
  extended_time: { type: Number, default: 0 }, // Extended time in minutes
  extraSnacksPrice: { type: Number, default: 0 }, // Array of extra snacks prices
  ledger: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerLedger" }, // Reference to ledger
  remainingAmount: { type: Number, default: 0 },
  couponDetails: {
    code: {
      type: String,
      default: null,
    },
    store: {
      type: Number,
      default: null,
    },
    discountType: {
      type: String,
      default: null,
    },
    value: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
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
  },
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
