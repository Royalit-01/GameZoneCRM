const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  game: String,
  players: Number,
  duration: Number,
  amount: Number,
  snacks: { type: Number, default: 0 }, // Price of snacks
  drink: { type: Number, default: 0 }, // Price of drinks
  
  startTime: { type: Date, default: Date.now },
  screen: String
});

module.exports = mongoose.model("GameSession", gameSessionSchema);
