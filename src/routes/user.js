const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, addAllowedIP, updateUserProfile, forgotPassword, resetPassword } = require('../controllers/user');
const { authenticate } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticate, getUserProfile);
router.post('/allowed-ip', authenticate, addAllowedIP);
router.put('/profile', authenticate, updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;