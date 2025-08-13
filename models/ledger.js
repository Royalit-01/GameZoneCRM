const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  ledgerEntries: [
    {
      date: Date,
      time: String, // Add time field
      due: Date,
      initialBalance: Number,
      payment: Number,
      total: Number,
    },
  ],
  transactions: [
    {
      customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      date: Date,
      time: String, // Add time field
      description: String,
      amount: Number,
      transactionType: { type: String, enum: ["credit", "debit"] },
    },
  ],
  store: { type: Number, required: true },
});

const CustomerLedger = mongoose.model("CustomerLedger", ledgerSchema);
module.exports = CustomerLedger;
