const Order = require('../models/Order');
const DeliveryAgent = require('../models/DeliveryAgent');
const User = require('../models/User');

// @desc    Get orders assigned to the logged-in delivery agent
// @route   GET /api/delivery/orders
// @access  Private (DeliveryAgent)
const getAssignedOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ deliveryAgent: req.user._id })
      .populate('restaurant', 'name phone address area city location')
      .populate('customer', 'name phone')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery progress (Picked Up, Out for Delivery, Delivered)
// @route   PUT /api/delivery/orders/:id/status
// @access  Private (DeliveryAgent)
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.deliveryAgent || order.deliveryAgent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not the assigned delivery agent for this order'
      });
    }

    const validStatuses = ['Picked Up', 'Out for Delivery', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid delivery status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.paymentStatus = 'PAID'; // If COD, marked paid upon delivery
    }

    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Delivery Agent updated status to ${status}`
    });

    await order.save();

    res.json({
      success: true,
      order,
      message: `Order marked as ${status}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available delivery agents in an area or platform
// @route   GET /api/delivery/agents
// @access  Private (RestaurantAdmin, SuperAdmin)
const getAvailableAgents = async (req, res, next) => {
  try {
    const { area, city } = req.query;
    const filter = { isAvailable: true };

    if (city || area) {
      filter.serviceArea = new RegExp(city || area, 'i');
    }

    // Also find users with role deliveryAgent
    const agents = await DeliveryAgent.find(filter).populate('user', 'name email phone');

    // If none found for that specific string, return all available agents
    let result = agents;
    if (agents.length === 0) {
      result = await DeliveryAgent.find({ isAvailable: true }).populate('user', 'name email phone');
    }

    res.json({
      success: true,
      count: result.length,
      agents: result.map((agent) => ({
        ...agent.toObject(),
        userId: agent.user?._id || agent.user
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle agent availability (online/offline)
// @route   PUT /api/delivery/availability
// @access  Private (DeliveryAgent)
const toggleAvailability = async (req, res, next) => {
  try {
    let agent = await DeliveryAgent.findOne({ user: req.user._id });
    if (!agent) {
      agent = await DeliveryAgent.create({
        user: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        serviceArea: 'Gadag',
        isAvailable: true
      });
    }

    agent.isAvailable = !agent.isAvailable;
    await agent.save();

    res.json({
      success: true,
      isAvailable: agent.isAvailable,
      message: `Status updated to ${agent.isAvailable ? 'Online' : 'Offline'}`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignedOrders,
  updateDeliveryStatus,
  getAvailableAgents,
  toggleAvailability
};
