const User = require('../models/User');
const Item = require('../models/Item');
const Bid = require('../models/Bid');

// Get admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const totalBids = await Bid.countDocuments();
    const activeAuctions = await Item.countDocuments({ 
      endTime: { $gt: new Date() } 
    });
    const endedAuctions = await Item.countDocuments({ 
      endTime: { $lte: new Date() } 
    });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    const recentItems = await Item.find()
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title currentBid endTime seller createdAt');

    const recentBids = await Bid.find()
      .populate('bidder', 'name email')
      .populate('item', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount bidder item createdAt');

    res.json({
      stats: {
        totalUsers,
        totalItems,
        totalBids,
        activeAuctions,
        endedAuctions,
        bannedUsers
      },
      recentActivity: {
        users: recentUsers,
        items: recentItems,
        bids: recentBids
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = search 
      ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Ban/Unban user
exports.toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'Admin') {
      return res.status(403).json({ message: 'Cannot ban admin users.' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ 
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    console.error('Toggle user ban error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['Seller', 'Buyer', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    res.json({ 
      message: 'User role updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all items with pagination
exports.getAllItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    let query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    if (status === 'active') {
      query.endTime = { $gt: new Date() };
    } else if (status === 'ended') {
      query.endTime = { $lte: new Date() };
    }

    const items = await Item.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(query);

    res.json({
      items,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete item (admin only)
exports.deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Delete associated bids
    await Bid.deleteMany({ item: itemId });
    
    // Delete the item
    await Item.findByIdAndDelete(itemId);

    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all bids with pagination
exports.getAllBids = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const itemId = req.query.itemId || '';

    let query = {};
    if (itemId) {
      query.item = itemId;
    }

    const bids = await Bid.find(query)
      .populate('bidder', 'name email')
      .populate('item', 'title currentBid')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Bid.countDocuments(query);

    res.json({
      bids,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete bid (admin only)
exports.deleteBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const bid = await Bid.findById(bidId);
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found.' });
    }

    await Bid.findByIdAndDelete(bidId);

    res.json({ message: 'Bid deleted successfully.' });
  } catch (error) {
    console.error('Delete bid error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

