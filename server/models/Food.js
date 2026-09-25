const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant reference is required']
  },
  name: {
    type: String,
    required: [true, 'Food item name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: 'Main Course'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60'
  },
  isVegetarian: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

foodSchema.index({ restaurant: 1, category: 1 });

module.exports = mongoose.model('Food', foodSchema);
