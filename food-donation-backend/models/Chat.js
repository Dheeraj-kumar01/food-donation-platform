const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodListing',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
chatSchema.index({ food: 1, createdAt: -1 });
chatSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model('Chat', chatSchema);