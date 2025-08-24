const Item = require('../models/Item');
const Bid = require('../models/Bid');

// Add item
exports.addItem = async (req, res) => {
  try {
    const { title, description, category, images, basePrice, auctionDuration } = req.body;
    
    // Validate input
    if (!title || !description || !category || !basePrice || !auctionDuration) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    if (basePrice <= 0) {
      return res.status(400).json({ message: 'Base price must be greater than 0.' });
    }
    
    if (auctionDuration <= 0 || auctionDuration > 720) { // Max 30 days
      return res.status(400).json({ message: 'Auction duration must be between 1 and 720 hours.' });
    }
    
    const endTime = new Date(Date.now() + auctionDuration * 60 * 60 * 1000);
    
    const item = await Item.create({
      seller: req.user._id,
      title,
      description,
      category,
      images: images || [],
      basePrice,
      currentBid: basePrice,
      auctionDuration,
      endTime,
    });
    
    await item.populate('seller', 'name email');
    res.status(201).json(item);
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Edit item (only if no bids)
exports.editItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    
    // Check if auction has started (has bids)
    const bidCount = await Bid.countDocuments({ item: item._id });
    if (bidCount > 0) {
      return res.status(400).json({ message: 'Cannot edit item with bids.' });
    }
    
    // Check if auction has ended
    if (item.endTime <= new Date()) {
      return res.status(400).json({ message: 'Cannot edit ended auction.' });
    }
    
    const { title, description, category, images, basePrice, auctionDuration } = req.body;
    
    // Update fields
    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (images) item.images = images;
    if (basePrice && basePrice > 0) {
      item.basePrice = basePrice;
      item.currentBid = basePrice;
    }
    if (auctionDuration && auctionDuration > 0 && auctionDuration <= 720) {
      item.auctionDuration = auctionDuration;
      item.endTime = new Date(Date.now() + auctionDuration * 60 * 60 * 1000);
    }
    
    await item.save();
    await item.populate('seller', 'name email');
    res.json(item);
  } catch (error) {
    console.error('Edit item error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete item (only if no bids)
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    
    const bidCount = await Bid.countDocuments({ item: item._id });
    if (bidCount > 0) {
      return res.status(400).json({ message: 'Cannot delete item with bids.' });
    }
    
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// View seller's items
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ seller: req.user._id })
      .populate('seller', 'name email')
      .populate('winner', 'name email')
      .sort({ createdAt: -1 });
    
    // Update status for each item
    for (let item of items) {
      await item.updateStatus();
    }
    
    res.json(items);
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// View bid history for an item
exports.getBidHistory = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    
    const bids = await Bid.find({ item: item._id })
      .populate('bidder', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(bids);
  } catch (error) {
    console.error('Get bid history error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all items (public)
exports.getAllItems = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 12 } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by status
    if (status === 'active') {
      query.endTime = { $gt: new Date() };
      query.status = 'active';
    } else if (status === 'ended') {
      query.$or = [
        { endTime: { $lte: new Date() } },
        { status: { $in: ['expired', 'sold', 'closed'] } }
      ];
    }
    
    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    const skip = (page - 1) * limit;
    
    const items = await Item.find(query)
      .populate('seller', 'name')
      .populate('winner', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    // Update status for each item
    for (let item of items) {
      await item.updateStatus();
    }
    
    const total = await Item.countDocuments(query);
    
    res.json({
      items,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get item by ID (public)
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('winner', 'name email');
      
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    
    // Update status
    await item.updateStatus();
    
    res.json(item);
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get item bids (public)
exports.getItemBids = async (req, res) => {
  try {
    const bids = await Bid.find({ item: req.params.id })
      .populate('bidder', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(bids);
  } catch (error) {
    console.error('Get item bids error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
}; 

// Upload images for item
exports.uploadImages = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    
    const upload = req.app.locals.upload;
    
    upload.array('images', 5)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded.' });
      }
      
      const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      
      // Add new images to existing ones
      item.images = [...item.images, ...imageUrls];
      await item.save();
      
      res.json({ 
        message: 'Images uploaded successfully.',
        images: item.images 
      });
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
}; 