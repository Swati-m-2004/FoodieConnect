const express = require('express');
const router = express.Router();
const {
  getNearbyRestaurants,
  getRestaurantById,
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
  getAllRestaurants,
  toggleRestaurantApproval
} = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public routes
router.get('/nearby', getNearbyRestaurants);
router.get('/all', getAllRestaurants);
router.get('/my/profile', protect, authorizeRoles('restaurantAdmin'), getMyRestaurant);
router.get('/:id', getRestaurantById);

// Protected routes
router.post('/', protect, authorizeRoles('restaurantAdmin'), createRestaurant);
router.put('/:id', protect, authorizeRoles('restaurantAdmin', 'superAdmin'), updateRestaurant);
router.put('/:id/approval', protect, authorizeRoles('superAdmin'), toggleRestaurantApproval);

module.exports = router;
