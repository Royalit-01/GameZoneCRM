const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameName: { type: String, required: true },
  allowedPlayers: { type: Number, required: true },
  pricing: {
    type: mongoose.Schema.Types.Mixed, // accepts any nested object
    default: {},
  },
}, { _id: false });

const screenSchema = new mongoose.Schema({
  screenName: { type: String, required: true },
  games: [gameSchema],
}, { _id: false });

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  address: { type: String, required: true },
  screens: [screenSchema],
  isCafeEnabled: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
