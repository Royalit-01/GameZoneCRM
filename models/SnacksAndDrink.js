const mongoose = require('mongoose');

const SnacksAndDrinkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ['Snack', 'Drink'],
    required: true,
  },
}, {
  timestamps: true // Optional: adds createdAt and updatedAt fields
});

const SnacksAndDrink = mongoose.model('SnacksAndDrink', SnacksAndDrinkSchema);

module.exports = SnacksAndDrink;
