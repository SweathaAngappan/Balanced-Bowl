const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  story: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "Anonymous",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Story', StorySchema);
