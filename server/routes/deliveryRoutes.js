const express = require('express');
const router = express.Router();
const {
  getAssignedOrders,
  updateDeliveryStatus,
  getAvailableAgents,
  toggleAvailability
} = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/orders', protect, authorizeRoles('deliveryAgent'), getAssignedOrders);
router.put('/orders/:id/status', protect, authorizeRoles('deliveryAgent'), updateDeliveryStatus);
router.get('/agents', protect, authorizeRoles('restaurantAdmin', 'superAdmin'), getAvailableAgents);
router.put('/availability', protect, authorizeRoles('deliveryAgent'), toggleAvailability);

module.exports = router;
