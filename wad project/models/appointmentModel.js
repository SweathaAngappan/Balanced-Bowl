const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dietician: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  timeSlot: String,
  status: { type: String, enum: ["booked","confirmed","completed","cancelled"], default: "booked" },
  paymentStatus: { type: String, enum: ["pending","paid","failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  notes: String
});

module.exports = mongoose.model("Appointment", appointmentSchema);
