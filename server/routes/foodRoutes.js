const express = require('express');
const router = express.Router();
const {
  getFoodsByRestaurant,
  addFoodItem,
  updateFoodItem,
  toggleFoodAvailability,
  deleteFoodItem
} = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/restaurant/:restaurantId', getFoodsByRestaurant);
router.post('/', protect, authorizeRoles('restaurantAdmin'), addFoodItem);
router.put('/:id', protect, authorizeRoles('restaurantAdmin', 'superAdmin'), updateFoodItem);
router.patch('/:id/availability', protect, authorizeRoles('restaurantAdmin', 'superAdmin'), toggleFoodAvailability);
router.delete('/:id', protect, authorizeRoles('restaurantAdmin', 'superAdmin'), deleteFoodItem);

module.exports = router;
