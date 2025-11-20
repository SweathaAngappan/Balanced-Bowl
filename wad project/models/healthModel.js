const mongoose = require("mongoose");

const healthSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weight: Number,
  height: Number,
  bmi: Number,
  goals: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Health", healthSchema);
