const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: [true, 'Restaurant contact email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Restaurant phone number is required']
  },
  cuisine: {
    type: [String],
    default: ['Multi-Cuisine']
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60'
  },
  address: {
    type: String,
    required: [true, 'Full address is required']
  },
  city: {
    type: String,
    required: [true, 'City/Town is required'],
    trim: true
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    trim: true
  },
  state: {
    type: String,
    default: 'Karnataka'
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required for restaurant location']
    }
  },
  deliveryRadius: {
    type: Number,
    required: [true, 'Delivery radius in km is required'],
    default: 5
  },
  deliveryFee: {
    type: Number,
    default: 35
  },
  minOrderAmount: {
    type: Number,
    default: 100
  },
  estimatedDeliveryTime: {
    type: String,
    default: '25-35 min'
  },
  rating: {
    type: Number,
    default: 4.5
  },
  openingTime: {
    type: String,
    default: '09:00 AM'
  },
  closingTime: {
    type: String,
    default: '11:00 PM'
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Create 2dsphere index for location queries
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
