const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  toggleBlockUser,
  getAllPlatformOrders
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect, authorizeRoles('superAdmin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.get('/orders', getAllPlatformOrders);

module.exports = router;
