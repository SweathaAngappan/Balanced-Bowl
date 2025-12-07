const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dietician: { type: mongoose.Schema.Types.ObjectId, ref: 'Dietician' }, // optional
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },     // optional
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

// Ensure at least one target is specified (dietician or session)
reviewSchema.pre('validate', function(next) {
  if (!this.dietician && !this.session) {
    next(new Error('Review must belong to a dietician or a session.'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Review', reviewSchema);
