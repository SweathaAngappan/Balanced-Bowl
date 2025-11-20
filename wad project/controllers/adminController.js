const User = require("../models/userModel");
const Appointment = require("../models/appointmentModel");

exports.dashboard = async (req, res) => {
  const users = await User.find();
  const appts = await Appointment.find().populate("user dietician");
  res.render("admin/dashboard", { users, appts });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
};
