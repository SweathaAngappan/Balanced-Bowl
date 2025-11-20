const User = require("../models/userModel");
const Review = require("../models/reviewModel");

exports.list = async (req, res) => {
  const { q, specialization, location } = req.query;
  const filter = { role: "dietician" };
  if (specialization) filter.specialization = specialization;
  if (location) filter.location = location;
  if (q) filter.$or = [
    { name: new RegExp(q, "i") },
    { specialization: new RegExp(q, "i") }
  ];
  const dieticians = await User.find(filter);
  res.render("dieticians/list", { dieticians, query: req.query });
};

exports.profile = async (req, res) => {
  const dietician = await User.findById(req.params.id);
  const reviews = await Review.find({ dietician: dietician._id }).populate("user");
  res.render("dieticians/profile", { dietician, reviews });
};
