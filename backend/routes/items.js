const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const bidController = require('../controllers/bidController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.get('/:id/bids', itemController.getItemBids);

// Protected routes
router.post('/:id/bid', protect, bidController.placeBid);

module.exports = router;
