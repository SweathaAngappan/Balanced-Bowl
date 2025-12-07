const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dietician: { type: mongoose.Schema.Types.ObjectId, ref: 'Dietician', required: true },

  date: { type: Date, required: true },
  mode: { type: String, enum: ['online','in-person'], default: 'online' },

  status: { type: String, enum: ['booked','completed','cancelled'], default: 'booked' },
  cancelReason: { type: String },        // NEW
  lastReminderAt: { type: Date },        // NEW

  paymentConfirmed: { type: Boolean, default: false },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
