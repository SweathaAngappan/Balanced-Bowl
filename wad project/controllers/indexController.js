const User = require("../models/userModel");

exports.home = async (req, res) => {
  const dieticians = await User.find({ role: "dietician" }).limit(6);
  res.render("index", { dieticians });
};

exports.about = (req, res) => res.render("about");
