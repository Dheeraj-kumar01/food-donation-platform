const express = require('express');
const { getMessages, sendMessage, markAsRead } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:foodId', protect, getMessages);
router.post('/', protect, sendMessage);
router.put('/:foodId/read', protect, markAsRead);

module.exports = router;