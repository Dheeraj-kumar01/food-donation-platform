const Chat = require('../models/Chat');
const FoodListing = require('../models/FoodListing');

// @desc    Get messages for a food listing
// @route   GET /api/chat/:foodId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const food = await FoodListing.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.donor.toString() !== req.user._id.toString() && 
        (!food.claimedBy || food.claimedBy.toString() !== req.user._id.toString())) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const messages = await Chat.find({ food: foodId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name role');

    const total = await Chat.countDocuments({ food: foodId });

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { foodId, receiverId, message } = req.body;

    const food = await FoodListing.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.donor.toString() !== req.user._id.toString() && 
        (!food.claimedBy || food.claimedBy.toString() !== req.user._id.toString())) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const chat = await Chat.create({
      food: foodId,
      sender: req.user._id,
      receiver: receiverId,
      message,
      read: false
    });

    await chat.populate('sender', 'name role');

    res.status(201).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:foodId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { foodId } = req.params;

    await Chat.updateMany(
      { food: foodId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMessages, sendMessage, markAsRead };