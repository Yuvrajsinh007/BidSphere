const Item = require('../models/Item');
const Bid = require('../models/Bid');
const upload = require('../middleware/upload');
const nodemailer = require('nodemailer');

// Email Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper: Check and Finalize Auction
const checkAndProcessAuctionEnd = async (item) => {
  const now = new Date();
  // Only process if time is up AND status is still active
  if (item.status === 'active' && new Date(item.endTime) <= now) {
    
    // Find the highest bid
    const highestBid = await Bid.findOne({ item: item._id })
      .sort({ amount: -1 })
      .populate('bidder');

    if (highestBid) {
      item.status = 'sold';
      item.winner = highestBid.bidder._id;
      item.currentBid = highestBid.amount;
      
      await item.save(); // Save winner status first

      // Send Emails asynchronously
      sendAuctionResultEmails(item, highestBid).catch(err => 
        console.error('Email sending failed:', err)
      );

    } else {
      item.status = 'expired';
      await item.save();
    }
  }
};

// Helper: Send Emails
const sendAuctionResultEmails = async (item, winningBid) => {
  try {
    // 1. Get all unique bidders for this item
    const allBids = await Bid.find({ item: item._id }).populate('bidder');
    const uniqueBidders = [...new Map(allBids.map(b => [b.bidder.email, b.bidder])).values()];

    const winnerEmail = winningBid.bidder.email;

    // 2. Loop through bidders and send appropriate email
    for (const bidder of uniqueBidders) {
      const isWinner = bidder.email === winnerEmail;
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: bidder.email,
        subject: isWinner ? `🎉 You Won! - ${item.title}` : `Auction Ended - ${item.title}`,
        html: isWinner 
          ? `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h1 style="color: #4f46e5;">Congratulations! 🎉</h1>
              <p>You have won the auction for <strong>${item.title}</strong>.</p>
              <p>Winning Bid: <strong style="color: #16a34a; font-size: 18px;">$${winningBid.amount}</strong></p>
              <p>Please contact the seller to arrange payment and delivery.</p>
            </div>
          `
          : `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #555;">Auction Ended</h2>
              <p>The auction for <strong>${item.title}</strong> has ended.</p>
              <p>Unfortunately, you did not win this time.</p>
              <p>Winning Bid: <strong>$${winningBid.amount}</strong></p>
              <p>Better luck next time!</p>
            </div>
          `
      };

      await transporter.sendMail(mailOptions);
    }
    console.log(`Auction emails sent for item: ${item._id}`);
  } catch (error) {
    console.error('Error sending auction emails:', error);
  }
};

// --- CONTROLLER METHODS UPDATED TO USE CHECK ---

// Add item
exports.addItem = async (req, res) => {
  try {
    const { title, description, category, basePrice, auctionDuration, customEndTime } = req.body;
    
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
    }

    // Validation: Require title, desc, cat, price. 
    // AND require EITHER auctionDuration OR customEndTime
    if (!title || !description || !category || !basePrice || (!auctionDuration && !customEndTime)) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    let endTime;
    let finalDuration;

    // LOGIC: Determine End Time
    if (customEndTime) {
      // 1. User provided a specific date/time
      endTime = new Date(customEndTime);
      
      // Validation: Must be in future
      if (endTime <= new Date()) {
        return res.status(400).json({ message: 'End time must be in the future.' });
      }

      // Calculate approximate duration in hours for the DB schema (since it's required)
      const diffMs = endTime - Date.now();
      finalDuration = diffMs / (1000 * 60 * 60); 

    } else {
      // 2. User provided fixed duration (hours)
      finalDuration = parseFloat(auctionDuration);
      endTime = new Date(Date.now() + finalDuration * 60 * 60 * 1000);
    }
    
    const item = await Item.create({
      seller: req.user._id,
      title,
      description,
      category,
      images: imageUrls,
      basePrice,
      currentBid: basePrice,
      auctionDuration: finalDuration, // Store calculated or provided duration
      endTime,
    });
    
    await item.populate('seller', 'name email');
    res.status(201).json(item);
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all items (public)
exports.getAllItems = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 12 } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    // Standardize finding items first
    let items = await Item.find(query)
      .populate('seller', 'name')
      .populate('winner', 'name')
      .sort({ createdAt: -1 });

    // Process status checks for ALL fetched items
    for (let item of items) {
      await checkAndProcessAuctionEnd(item);
    }

    // Now filter by status in memory or refetch (Memory is safer after update)
    // For pagination accuracy, it's better to update first then query, 
    // but for performance on large DBs, you'd run a cron job. 
    // Here we'll just filter the results for the response.
    
    if (status === 'active') {
      items = items.filter(i => i.status === 'active' && new Date(i.endTime) > new Date());
    } else if (status === 'ended') {
      items = items.filter(i => i.status !== 'active' || new Date(i.endTime) <= new Date());
    }

    // Manual pagination since we filtered in memory
    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + parseInt(limit));
    
    res.json({
      items: paginatedItems,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: startIndex + parseInt(limit) < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('winner', 'name email');
      
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    
    // Check status
    await checkAndProcessAuctionEnd(item);
    
    res.json(item);
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// View seller's items
exports.getMyItems = async (req, res) => {
  try {
    // 1. Fetch items where 'seller' matches the logged-in user's ID
    // 2. Sort by 'createdAt' descending (-1) so newest are first
    const items = await Item.find({ seller: req.user._id })
      .populate('seller', 'name email')
      .populate('winner', 'name email')
      .sort({ createdAt: -1 });
    
    // 3. Update statuses (Active -> Expired/Sold) if time has passed
    // This ensures your Dashboard stats (Active vs Sold) are accurate right now
    for (let item of items) {
      await checkAndProcessAuctionEnd(item);
    }
    
    res.json(items);
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// -- KEEP OTHER METHODS (editItem, deleteItem, etc.) SAME AS BEFORE --
exports.editItem = async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found.' });
      if (item.seller.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden.' });
      
      const bidCount = await Bid.countDocuments({ item: item._id });
      if (bidCount > 0) return res.status(400).json({ message: 'Cannot edit item with bids.' });
      if (item.endTime <= new Date()) return res.status(400).json({ message: 'Cannot edit ended auction.' });
      
      const { title, description, category, images, basePrice, auctionDuration } = req.body;
      
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
  
exports.deleteItem = async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found.' });
      if (item.seller.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden.' });
      
      const bidCount = await Bid.countDocuments({ item: item._id });
      if (bidCount > 0) return res.status(400).json({ message: 'Cannot delete item with bids.' });
      
      await Item.findByIdAndDelete(req.params.id);
      res.json({ message: 'Item deleted successfully.' });
    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({ message: 'Server error.' });
    }
};

exports.getBidHistory = async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found.' });
      if (item.seller.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden.' });
      
      const bids = await Bid.find({ item: item._id }).populate('bidder', 'name email').sort({ createdAt: -1 });
      res.json(bids);
    } catch (error) {
      console.error('Get bid history error:', error);
      res.status(500).json({ message: 'Server error.' });
    }
};

exports.getItemBids = async (req, res) => {
    try {
      const bids = await Bid.find({ item: req.params.id }).populate('bidder', 'name email').sort({ createdAt: -1 });
      res.json(bids);
    } catch (error) {
      console.error('Get item bids error:', error);
      res.status(500).json({ message: 'Server error.' });
    }
}; 
  
exports.uploadImages = async (req, res) => {
      try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found.' });
        if (item.seller.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden.' });
    
        upload.array('images', 5)(req, res, async (err) => {
          if (err) return res.status(400).json({ message: err.message });
          if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No images uploaded.' });
          
          const imageUrls = req.files.map(file => file.path);
          item.images = [...item.images, ...imageUrls];
          await item.save();
          res.json({ message: 'Images uploaded successfully.', images: item.images });
        });
      } catch (error) {
        console.error('Upload images error:', error);
        res.status(500).json({ message: 'Server error.' });
      }
};