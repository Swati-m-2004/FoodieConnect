const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const { calculateDistance } = require('../utils/distanceCalculator');

// @desc    Get restaurants within delivery radius of customer coordinates
// @route   GET /api/restaurants/nearby
// @access  Public
const getNearbyRestaurants = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      search = '',
      cuisine,
      vegOnly = 'false',
      sortBy = 'distance' // 'distance', 'rating', 'deliveryTime'
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Customer latitude and longitude are required to find serviceable restaurants'
      });
    }

    const customerLat = parseFloat(lat);
    const customerLng = parseFloat(lng);

    // Fetch approved restaurants
    const query = { isApproved: true, isOpen: true };
    if (cuisine && cuisine !== 'All') {
      query.cuisine = { $in: [new RegExp(cuisine, 'i')] };
    }

    const allRestaurants = await Restaurant.find(query).lean();

    // Filter by geographical delivery radius and attach calculated distance
    const serviceableRestaurants = [];

    for (const rest of allRestaurants) {
      if (!rest.location || !rest.location.coordinates || rest.location.coordinates.length < 2) {
        continue;
      }

      const restLng = rest.location.coordinates[0];
      const restLat = rest.location.coordinates[1];

      const distance = calculateDistance(customerLat, customerLng, restLat, restLng);

      // Check if distance <= restaurant's delivery radius
      if (distance <= rest.deliveryRadius) {
        // Search filter matching name or cuisine
        if (search.trim()) {
          const s = search.toLowerCase();
          const matchesName = rest.name.toLowerCase().includes(s);
          const matchesCuisine = rest.cuisine.some(c => c.toLowerCase().includes(s));
          const matchesCity = rest.city.toLowerCase().includes(s) || rest.area.toLowerCase().includes(s);
          if (!matchesName && !matchesCuisine && !matchesCity) {
            continue;
          }
        }

        // Check veg-only requirement if requested
        if (vegOnly === 'true') {
          const hasVegFood = await Food.exists({
            restaurant: rest._id,
            isVegetarian: true,
            isAvailable: true
          });
          if (!hasVegFood) continue;
        }

        serviceableRestaurants.push({
          ...rest,
          distance, // in km
          isDeliverable: true
        });
      }
    }

    // Sort restaurants
    if (sortBy === 'distance') {
      serviceableRestaurants.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'rating') {
      serviceableRestaurants.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'deliveryFee') {
      serviceableRestaurants.sort((a, b) => a.deliveryFee - b.deliveryFee);
    }

    res.json({
      success: true,
      count: serviceableRestaurants.length,
      customerLocation: { lat: customerLat, lng: customerLng },
      restaurants: serviceableRestaurants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single restaurant by ID with its menu
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const { lat, lng } = req.query;
    let distance = null;
    let isDeliverable = true;

    if (lat && lng && restaurant.location && restaurant.location.coordinates) {
      const restLng = restaurant.location.coordinates[0];
      const restLat = restaurant.location.coordinates[1];
      distance = calculateDistance(parseFloat(lat), parseFloat(lng), restLat, restLng);
      isDeliverable = distance <= restaurant.deliveryRadius;
    }

    // Fetch menu items
    const foods = await Food.find({ restaurant: restaurant._id });

    // Group foods by category
    const categoriesMap = {};
    foods.forEach(food => {
      const cat = food.category || 'General';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = [];
      }
      categoriesMap[cat].push(food);
    });

    res.json({
      success: true,
      restaurant: {
        ...restaurant.toObject(),
        distance,
        isDeliverable
      },
      foods,
      categories: Object.keys(categoriesMap).map(category => ({
        name: category,
        items: categoriesMap[category]
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register / Create a restaurant profile
// @route   POST /api/restaurants
// @access  Private (RestaurantAdmin)
const createRestaurant = async (req, res, next) => {
  try {
    const existingRestaurant = await Restaurant.findOne({ admin: req.user._id });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered a restaurant under this account'
      });
    }

    const {
      name,
      description,
      email,
      phone,
      cuisine,
      image,
      address,
      city,
      area,
      state = 'Karnataka',
      pincode,
      coordinates, // [longitude, latitude]
      deliveryRadius = 5,
      deliveryFee = 35,
      minOrderAmount = 100,
      openingTime = '09:00 AM',
      closingTime = '11:00 PM'
    } = req.body;

    if (!name || !email || !phone || !address || !city || !area || !pincode || !coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including location coordinates'
      });
    }

    const restaurant = await Restaurant.create({
      name,
      description: description || '',
      email,
      phone,
      cuisine: Array.isArray(cuisine) ? cuisine : (cuisine ? cuisine.split(',').map(c => c.trim()) : ['Multi-Cuisine']),
      image: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60',
      address,
      city,
      area,
      state,
      pincode,
      location: {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      },
      deliveryRadius: parseFloat(deliveryRadius),
      deliveryFee: parseFloat(deliveryFee),
      minOrderAmount: parseFloat(minOrderAmount),
      openingTime,
      closingTime,
      isOpen: true,
      isApproved: false,
      admin: req.user._id
    });

    res.status(201).json({
      success: true,
      restaurant,
      message: 'Restaurant registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current restaurant admin's restaurant profile
// @route   GET /api/restaurants/my/profile
// @access  Private (RestaurantAdmin)
const getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ admin: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this administrator account'
      });
    }

    res.json({
      success: true,
      restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant profile & location
// @route   PUT /api/restaurants/:id
// @access  Private (RestaurantAdmin, SuperAdmin)
const updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Role verification: only the owner admin or superAdmin
    if (req.user.role !== 'superAdmin' && restaurant.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update another restaurant'
      });
    }

    const {
      name,
      description,
      phone,
      email,
      cuisine,
      image,
      address,
      city,
      area,
      pincode,
      coordinates,
      deliveryRadius,
      deliveryFee,
      minOrderAmount,
      openingTime,
      closingTime,
      isOpen
    } = req.body;

    if (name) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (phone) restaurant.phone = phone;
    if (email) restaurant.email = email;
    if (cuisine) {
      restaurant.cuisine = Array.isArray(cuisine) ? cuisine : cuisine.split(',').map(c => c.trim());
    }
    if (image) restaurant.image = image;
    if (address) restaurant.address = address;
    if (city) restaurant.city = city;
    if (area) restaurant.area = area;
    if (pincode) restaurant.pincode = pincode;
    if (deliveryRadius !== undefined) restaurant.deliveryRadius = parseFloat(deliveryRadius);
    if (deliveryFee !== undefined) restaurant.deliveryFee = parseFloat(deliveryFee);
    if (minOrderAmount !== undefined) restaurant.minOrderAmount = parseFloat(minOrderAmount);
    if (openingTime) restaurant.openingTime = openingTime;
    if (closingTime) restaurant.closingTime = closingTime;
    if (isOpen !== undefined) restaurant.isOpen = isOpen;

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      restaurant.location = {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      };
    }

    await restaurant.save();

    res.json({
      success: true,
      restaurant,
      message: 'Restaurant profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all restaurants (Super Admin / directory)
// @route   GET /api/restaurants
// @access  Public / SuperAdmin
const getAllRestaurants = async (req, res, next) => {
  try {
    const { approved, city } = req.query;
    const query = {};

    if (approved !== undefined) {
      query.isApproved = approved === 'true';
    }
    if (city) {
      query.city = new RegExp(city, 'i');
    }

    const restaurants = await Restaurant.find(query).populate('admin', 'name email phone').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: restaurants.length,
      restaurants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a restaurant
// @route   PUT /api/restaurants/:id/approval
// @access  Private (SuperAdmin)
const toggleRestaurantApproval = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    restaurant.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : !restaurant.isApproved;
    await restaurant.save();

    res.json({
      success: true,
      restaurant,
      message: `Restaurant ${restaurant.isApproved ? 'approved' : 'unapproved'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbyRestaurants,
  getRestaurantById,
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
  getAllRestaurants,
  toggleRestaurantApproval
};
