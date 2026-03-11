const express = require('express');
const router = express.Router();
const { createEscrow, getTransaction, markDelivered, confirmRelease, dispute, forceRelease } = require('../controllers/escrow');
const { apiKeyAuth } = require('../middleware/auth');

router.post('/create', apiKeyAuth, createEscrow);
router.get('/:id', apiKeyAuth, getTransaction);
router.post('/:id/mark-delivered', apiKeyAuth, markDelivered);
router.post('/:id/confirm', apiKeyAuth, confirmRelease);
router.post('/:id/dispute', apiKeyAuth, dispute);
router.post('/:id/force-release', apiKeyAuth, forceRelease);

module.exports = router;