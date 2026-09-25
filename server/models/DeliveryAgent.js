const mongoose = require('mongoose');

const deliveryAgentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  serviceArea: {
    type: String,
    required: [true, 'Service area or city is required'],
    trim: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [75.6267, 15.4284] // Default Gadag coordinates
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

deliveryAgentSchema.index({ currentLocation: '2dsphere' });
deliveryAgentSchema.index({ serviceArea: 1 });

module.exports = mongoose.model('DeliveryAgent', deliveryAgentSchema);
