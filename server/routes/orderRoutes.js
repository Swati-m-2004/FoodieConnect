const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, authorizeRoles('customer'), createOrder);
router.get('/my-orders', protect, authorizeRoles('customer'), getMyOrders);
router.get('/restaurant/all', protect, authorizeRoles('restaurantAdmin'), getRestaurantOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorizeRoles('restaurantAdmin', 'superAdmin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
