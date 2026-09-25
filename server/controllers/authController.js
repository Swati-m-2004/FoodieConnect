const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const DeliveryAgent = require('../models/DeliveryAgent');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'foodieconnect_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user (Customer, Restaurant Admin, Delivery Agent)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      // Optional initial address (especially for customers)
      house,
      area,
      city,
      pincode,
      state = 'Karnataka',
      coordinates, // [longitude, latitude]
      serviceArea // for delivery agent
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Build address object if location provided
    const addresses = [];
    if (area && city && pincode) {
      // Default coordinates if not provided (e.g., Gadag center: [75.6267, 15.4284])
      const coords = Array.isArray(coordinates) && coordinates.length === 2
        ? [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
        : [75.6267, 15.4284];

      addresses.push({
        label: 'Home',
        house: house || '',
        area,
        city,
        state: state || 'Karnataka',
        pincode,
        fullAddress: `${house ? house + ', ' : ''}${area}, ${city}, ${pincode}`,
        location: {
          type: 'Point',
          coordinates: coords
        },
        isDefault: true
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'customer',
      addresses
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      },
      message: 'Account created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Check for user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the administrator.'
      });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    // If restaurant admin, look up their restaurant
    let restaurant = null;
    if (user.role === 'restaurantAdmin') {
      restaurant = await Restaurant.findOne({ admin: user._id });
    }

    // If delivery agent, look up agent profile
    let deliveryAgent = null;
    if (user.role === 'deliveryAgent') {
      deliveryAgent = await DeliveryAgent.findOne({ user: user._id });
    }

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        restaurant: restaurant ? {
          _id: restaurant._id,
          name: restaurant.name,
          isApproved: restaurant.isApproved,
          isOpen: restaurant.isOpen,
          city: restaurant.city,
          deliveryRadius: restaurant.deliveryRadius
        } : null,
        deliveryAgent: deliveryAgent ? {
          _id: deliveryAgent._id,
          serviceArea: deliveryAgent.serviceArea,
          isAvailable: deliveryAgent.isAvailable
        } : null
      },
      message: 'Logged in successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    let restaurant = null;
    if (user.role === 'restaurantAdmin') {
      restaurant = await Restaurant.findOne({ admin: user._id });
    }

    let deliveryAgent = null;
    if (user.role === 'deliveryAgent') {
      deliveryAgent = await DeliveryAgent.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        restaurant: restaurant || null,
        deliveryAgent: deliveryAgent || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a saved address to customer profile
// @route   POST /api/auth/addresses
// @access  Private (Customer)
const addAddress = async (req, res, next) => {
  try {
    const { label, house, area, city, state, pincode, coordinates, isDefault } = req.body;

    if (!area || !city || !pincode || !coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Area, city, pincode, and coordinates [longitude, latitude] are required'
      });
    }

    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    const newAddress = {
      label: label || 'Home',
      house: house || '',
      area,
      city,
      state: state || 'Karnataka',
      pincode,
      fullAddress: `${house ? house + ', ' : ''}${area}, ${city}, ${pincode}`,
      location: {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      },
      isDefault: isDefault || user.addresses.length === 0
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      addresses: user.addresses,
      message: 'Address added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a saved address
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private (Customer)
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== req.params.addressId
    );
    await user.save();

    res.json({
      success: true,
      addresses: user.addresses,
      message: 'Address removed'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  addAddress,
  deleteAddress
};
