const mongoose = require('mongoose');

const dieticianSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: [String],
  experienceYears: Number,
  consultationModes: [String],
  fee: { type: Number },
  certificates: [String],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },

  // NEW FIELDS FOR PAYMENT
  qrCodeUrl: { type: String },  // URL to the dietician's QR code image
  upiId: { type: String }       // Dietician's UPI ID
});

module.exports = mongoose.model('Dietician', dieticianSchema);
