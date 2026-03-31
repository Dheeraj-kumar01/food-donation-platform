const Request = require('../models/Request');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const { generateOTP, isOTPExpired } = require('../utils/generateOTP');

// @desc    Claim food
// @route   POST /api/requests
// @access  Private (Receiver only)
const claimFood = async (req, res) => {
  try {
    const { foodId, message } = req.body;

    const food = await FoodListing.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.status !== 'available') {
      return res.status(400).json({ message: 'Food is no longer available' });
    }

    const expiryDateTime = new Date(`${food.expiryDate}T${food.expiryTime}`);
    if (expiryDateTime < new Date()) {
      return res.status(400).json({ message: 'Food has expired' });
    }

    // Check if already claimed by this user
    const existingClaim = await Request.findOne({
      food: foodId,
      receiver: req.user._id,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You have already claimed this food' });
    }

    const request = await Request.create({
      food: foodId,
      donor: food.donor,
      receiver: req.user._id,
      message,
      status: 'pending'
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept claim
// @route   PUT /api/requests/:id/accept
// @access  Private (Donor only)
const acceptClaim = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('food', 'name quantity unit')
      .populate('receiver', 'name phone');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30); // OTP valid for 30 minutes

    request.otp = otp;
    request.otpExpiry = otpExpiry;
    request.status = 'accepted';
    await request.save();

    // Update food status
    await FoodListing.findByIdAndUpdate(request.food._id, {
      status: 'claimed',
      claimedBy: request.receiver._id
    });

    res.json({
      message: 'Claim accepted',
      request,
      otp // Send OTP to donor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject claim
// @route   PUT /api/requests/:id/reject
// @access  Private (Donor only)
const rejectClaim = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Claim rejected', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP and complete claim
// @route   POST /api/requests/:id/verify
// @access  Private (Receiver only)
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const request = await Request.findById(req.params.id)
      .populate('food', 'name quantity unit donor');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Claim not accepted yet' });
    }

    if (request.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (isOTPExpired(request.otpExpiry)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    request.otp = undefined;
    request.otpExpiry = undefined;
    await request.save();

    // Update food status
    await FoodListing.findByIdAndUpdate(request.food._id, {
      status: 'completed'
    });

    // Update receiver stats
    await User.findByIdAndUpdate(request.receiver, {
      $inc: { totalClaims: 1 }
    });

    res.json({ message: 'Food delivered successfully', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my claims (receiver)
// @route   GET /api/requests/my-claims
// @access  Private (Receiver)
const getMyClaims = async (req, res) => {
  try {
    const claims = await Request.find({ receiver: req.user._id })
      .populate('food', 'name quantity unit image pickupAddress')
      .populate('donor', 'name phone')
      .sort({ createdAt: -1 });
    
    res.json(claims);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get requests for my food (donor)
// @route   GET /api/requests/my-requests
// @access  Private (Donor)
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ donor: req.user._id })
      .populate('food', 'name quantity unit image')
      .populate('receiver', 'name phone')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add rating for claim
// @route   POST /api/requests/:id/rate
// @access  Private
const rateClaim = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed claims' });
    }

    if (request.receiver.toString() !== req.user._id.toString() && 
        request.donor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    request.rating = rating;
    request.review = review;
    await request.save();

    res.json({ message: 'Rating added successfully', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  claimFood,
  acceptClaim,
  rejectClaim,
  verifyOTP,
  getMyClaims,
  getMyRequests,
  rateClaim
};