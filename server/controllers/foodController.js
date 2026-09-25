const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');

// @desc    Get all food items for a restaurant
// @route   GET /api/foods/restaurant/:restaurantId
// @access  Public
const getFoodsByRestaurant = async (req, res, next) => {
  try {
    const foods = await Food.find({ restaurant: req.params.restaurantId }).sort({ category: 1, name: 1 });
    res.json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a food item
// @route   POST /api/foods
// @access  Private (RestaurantAdmin)
const addFoodItem = async (req, res, next) => {
  try {
    const { name, description, price, category, image, isVegetarian } = req.body;

    // Find restaurant administered by this user
    const restaurant = await Restaurant.findOne({ admin: req.user._id });
    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message: 'No restaurant associated with this admin account'
      });
    }

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Item name and price are required'
      });
    }

    const food = await Food.create({
      restaurant: restaurant._id,
      name,
      description: description || '',
      price: parseFloat(price),
      category: category || 'Main Course',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60',
      isVegetarian: isVegetarian !== undefined ? isVegetarian : true,
      isAvailable: true
    });

    res.status(201).json({
      success: true,
      food,
      message: 'Food item added to menu'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a food item
// @route   PUT /api/foods/:id
// @access  Private (RestaurantAdmin)
const updateFoodItem = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    const restaurant = await Restaurant.findById(food.restaurant);
    if (!restaurant || (req.user.role !== 'superAdmin' && restaurant.admin.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this food item'
      });
    }

    const { name, description, price, category, image, isVegetarian, isAvailable } = req.body;

    if (name) food.name = name;
    if (description !== undefined) food.description = description;
    if (price !== undefined) food.price = parseFloat(price);
    if (category) food.category = category;
    if (image) food.image = image;
    if (isVegetarian !== undefined) food.isVegetarian = isVegetarian;
    if (isAvailable !== undefined) food.isAvailable = isAvailable;

    await food.save();

    res.json({
      success: true,
      food,
      message: 'Food item updated'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle food item availability
// @route   PATCH /api/foods/:id/availability
// @access  Private (RestaurantAdmin)
const toggleFoodAvailability = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    const restaurant = await Restaurant.findById(food.restaurant);
    if (!restaurant || (req.user.role !== 'superAdmin' && restaurant.admin.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    food.isAvailable = !food.isAvailable;
    await food.save();

    res.json({
      success: true,
      food,
      message: `Food item marked as ${food.isAvailable ? 'In Stock' : 'Out of Stock'}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a food item
// @route   DELETE /api/foods/:id
// @access  Private (RestaurantAdmin)
const deleteFoodItem = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    const restaurant = await Restaurant.findById(food.restaurant);
    if (!restaurant || (req.user.role !== 'superAdmin' && restaurant.admin.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this food item'
      });
    }

    await food.deleteOne();

    res.json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoodsByRestaurant,
  addFoodItem,
  updateFoodItem,
  toggleFoodAvailability,
  deleteFoodItem
};
