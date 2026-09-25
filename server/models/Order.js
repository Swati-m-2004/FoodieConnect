const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String
  }
});

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [orderItemSchema],
  deliveryAddress: {
    label: { type: String, default: 'Home' },
    house: { type: String, default: '' },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: 'Karnataka' },
    pincode: { type: String, required: true },
    fullAddress: { type: String, default: '' }
  },
  deliveryLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'ONLINE'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },
  orderStatus: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Preparing',
      'Ready for Pickup',
      'Assigned to Delivery Agent',
      'Picked Up',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ],
    default: 'Pending'
  },
  deliveryAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  statusTimeline: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String, default: '' }
    }
  ]
}, { timestamps: true });

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ deliveryAgent: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
