const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and Seller role
router.use(protect, authorize('Seller'));

// Add item
router.post('/items', itemController.addItem);

// Upload images for item
router.post('/items/:id/images', itemController.uploadImages);

// Edit item
router.put('/items/:id', itemController.editItem);

// Delete item
router.delete('/items/:id', itemController.deleteItem);

// View seller's items
router.get('/items', itemController.getMyItems);

// View bid history for an item
router.get('/items/:id/bids', itemController.getBidHistory);

module.exports = router; 