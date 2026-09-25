const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const DeliveryAgent = require('../models/DeliveryAgent');
const { calculateDistance } = require('../utils/distanceCalculator');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddress,
      deliveryLocation, // { type: 'Point', coordinates: [lng, lat] }
      paymentMethod = 'COD'
    } = req.body;

    // 1. Validation: items and location
    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items and restaurant ID are required'
      });
    }

    if (!deliveryAddress || !deliveryLocation || !deliveryLocation.coordinates || deliveryLocation.coordinates.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Valid delivery address and map coordinates are required'
      });
    }

    // 2. Fetch and validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (!restaurant.isOpen) {
      return res.status(400).json({
        success: false,
        message: `${restaurant.name} is currently closed and not accepting orders`
      });
    }

    // 3. Geographical Validation: Verify customer is within delivery radius
    const customerLng = parseFloat(deliveryLocation.coordinates[0]);
    const customerLat = parseFloat(deliveryLocation.coordinates[1]);
    const restLng = restaurant.location.coordinates[0];
    const restLat = restaurant.location.coordinates[1];

    const distance = calculateDistance(customerLat, customerLng, restLat, restLng);

    if (distance > restaurant.deliveryRadius) {
      return res.status(400).json({
        success: false,
        message: `This restaurant does not deliver to the selected address. (Distance: ${distance} km exceeds delivery radius: ${restaurant.deliveryRadius} km). Please choose another restaurant or address.`
      });
    }

    // 4. Validate food items and calculate prices securely on backend
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const food = await Food.findById(item.foodId || item._id);
      if (!food) {
        return res.status(400).json({
          success: false,
          message: `Food item not found: ${item.name || item.foodId}`
        });
      }

      // Check food belongs to this restaurant
      if (food.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(400).json({
          success: false,
          message: `Item "${food.name}" belongs to a different restaurant. All items in an order must be from the same restaurant.`
        });
      }

      // Check food is available
      if (!food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `"${food.name}" is currently out of stock.`
        });
      }

      const qty = parseInt(item.quantity) || 1;
      const itemTotal = food.price * qty;
      subtotal += itemTotal;

      orderItems.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: qty,
        image: food.image
      });
    }

    // Minimum order check
    if (subtotal < restaurant.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for ${restaurant.name} is ₹${restaurant.minOrderAmount}`
      });
    }

    // Dynamic calculations
    const deliveryFee = restaurant.deliveryFee || 35;
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const discount = 0;
    const totalAmount = Math.round((subtotal + deliveryFee + tax - discount) * 100) / 100;

    // 5. Create the order
    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurant._id,
      items: orderItems,
      deliveryAddress: {
        label: deliveryAddress.label || 'Home',
        house: deliveryAddress.house || '',
        area: deliveryAddress.area,
        city: deliveryAddress.city,
        state: deliveryAddress.state || 'Karnataka',
        pincode: deliveryAddress.pincode,
        fullAddress: deliveryAddress.fullAddress || `${deliveryAddress.house ? deliveryAddress.house + ', ' : ''}${deliveryAddress.area}, ${deliveryAddress.city}`
      },
      deliveryLocation: {
        type: 'Point',
        coordinates: [customerLng, customerLat]
      },
      subtotal,
      deliveryFee,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      orderStatus: 'Pending',
      statusTimeline: [
        {
          status: 'Pending',
          timestamp: new Date(),
          note: 'Order placed by customer and sent to restaurant'
        }
      ]
    });

    res.status(201).json({
      success: true,
      order,
      message: 'Order placed successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in customer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name image address city area phone')
      .populate('deliveryAgent', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name image address city area phone location deliveryRadius')
      .populate('customer', 'name email phone')
      .populate('deliveryAgent', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Role-based access control
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superAdmin';
    const isAssignedAgent = order.deliveryAgent && order.deliveryAgent._id.toString() === req.user._id.toString();

    let isRestaurantOwner = false;
    if (req.user.role === 'restaurantAdmin') {
      const rest = await Restaurant.findOne({ admin: req.user._id });
      if (rest && rest._id.toString() === order.restaurant._id.toString()) {
        isRestaurantOwner = true;
      }
    }

    if (!isCustomer && !isSuperAdmin && !isAssignedAgent && !isRestaurantOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for the logged-in restaurant admin's restaurant
// @route   GET /api/orders/restaurant/all
// @access  Private (RestaurantAdmin)
const getRestaurantOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ admin: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this account'
      });
    }

    const { status } = req.query;
    const filter = { restaurant: restaurant._id };
    if (status && status !== 'All') {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name phone')
      .populate('deliveryAgent', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Confirmed, Preparing, Ready for Pickup, Assign Agent)
// @route   PUT /api/orders/:id/status
// @access  Private (RestaurantAdmin, SuperAdmin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, deliveryAgentId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (req.user.role !== 'superAdmin') {
      const restaurant = await Restaurant.findOne({ admin: req.user._id });
      if (!restaurant || restaurant._id.toString() !== order.restaurant.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to manage orders for this restaurant'
        });
      }
    }

    if (status) {
      order.orderStatus = status;
      order.statusTimeline.push({
        status,
        timestamp: new Date(),
        note: note || `Order status updated to ${status}`
      });
    }

    // If assigning delivery agent
    if (deliveryAgentId) {
      const agent = await DeliveryAgent.findOne({ user: deliveryAgentId, isAvailable: true });
      if (!agent) {
        return res.status(400).json({
          success: false,
          message: 'A valid available delivery agent is required'
        });
      }
      order.deliveryAgent = deliveryAgentId;
      order.orderStatus = 'Assigned to Delivery Agent';
      order.statusTimeline.push({
        status: 'Assigned to Delivery Agent',
        timestamp: new Date(),
        note: 'Order assigned to delivery agent for pickup'
      });
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('deliveryAgent', 'name phone');

    res.json({
      success: true,
      order: populatedOrder,
      message: 'Order updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Customer can cancel if Pending)
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer, RestaurantAdmin)
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const isCustomerOwner = req.user.role === 'customer' && order.customer.toString() === req.user._id.toString();
    const isRestaurantOwner = req.user.role === 'restaurantAdmin' && await Restaurant.exists({
      _id: order.restaurant,
      admin: req.user._id
    });

    if (!isCustomerOwner && !isRestaurantOwner && req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.orderStatus}`
      });
    }

    order.orderStatus = 'Cancelled';
    order.statusTimeline.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: req.body.reason || 'Order cancelled by user'
    });

    await order.save();

    res.json({
      success: true,
      order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  updateOrderStatus,
  cancelOrder
};
