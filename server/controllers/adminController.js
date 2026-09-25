const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const DeliveryAgent = require('../models/DeliveryAgent');

// @desc    Get complete platform analytics and statistics
// @route   GET /api/admin/stats
// @access  Private (SuperAdmin)
const getPlatformStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalRestaurants = await Restaurant.countDocuments();
    const approvedRestaurants = await Restaurant.countDocuments({ isApproved: true });
    const totalDeliveryAgents = await User.countDocuments({ role: 'deliveryAgent' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    // Revenue calculation (from Delivered orders or total active orders)
    const revenueAggregation = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    // Status breakdown
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalRestaurants,
        approvedRestaurants,
        totalDeliveryAgents,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (SuperAdmin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role && role !== 'All') {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block/unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private (SuperAdmin)
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'superAdmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block a Super Administrator'
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      isBlocked: user.isBlocked,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform orders (monitoring)
// @route   GET /api/admin/orders
// @access  Private (SuperAdmin)
const getAllPlatformOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'All') {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name city area phone')
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

module.exports = {
  getPlatformStats,
  getAllUsers,
  toggleBlockUser,
  getAllPlatformOrders
};
