const express = require('express');
const {
  claimFood,
  acceptClaim,
  rejectClaim,
  verifyOTP,
  getMyClaims,
  getMyRequests,
  rateClaim
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('receiver'), claimFood);
router.get('/my-claims', protect, authorize('receiver'), getMyClaims);
router.get('/my-requests', protect, authorize('donor'), getMyRequests);
router.put('/:id/accept', protect, authorize('donor'), acceptClaim);
router.put('/:id/reject', protect, authorize('donor'), rejectClaim);
router.post('/:id/verify', protect, authorize('receiver'), verifyOTP);
router.post('/:id/rate', protect, rateClaim);

module.exports = router;