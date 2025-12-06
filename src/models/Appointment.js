const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dietician: { type: mongoose.Schema.Types.ObjectId, ref: 'Dietician', required: true },
  date: { type: Date, required: true },
  mode: { type: String, enum: ['online','in-person'], default: 'online' },
  status: { type: String, enum: ['booked','completed','cancelled'], default: 'booked' },
  createdAt: { type: Date, default: Date.now },
  paymentConfirmed: { type: Boolean, default: false },
  notes: String
});

module.exports = mongoose.model('Appointment', appointmentSchema);
