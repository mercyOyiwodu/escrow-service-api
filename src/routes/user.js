const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, addAllowedIP, updateUserProfile } = require('../controllers/user');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getUserProfile);
router.post('/allowed-ip', addAllowedIP);
router.put('/profile', updateUserProfile);

module.exports = router;