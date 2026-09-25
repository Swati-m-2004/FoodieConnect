const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  addAddress,
  deleteAddress
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

module.exports = router;
