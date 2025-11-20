const bcrypt = require("bcrypt");
const User = require("../models/userModel");

exports.showRegister = (req, res) => res.render("auth/register", { error: null });
exports.showLogin = (req, res) => res.render("auth/login", { error: null });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, location, consultationType, about } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.render("auth/register", { error: "Email already used." });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      name, email, passwordHash: hash, role,
      specialization, location, consultationType, about
    });
    await user.save();
    req.session.user = { id: user._id, name: user.name, role: user.role };
    res.redirect("/");
  } catch (err) {
    res.render("auth/register", { error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.render("auth/login", { error: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.render("auth/login", { error: "Invalid credentials." });

    req.session.user = { id: user._id, name: user.name, role: user.role };
    res.redirect("/");
  } catch (err) {
    res.render("auth/login", { error: err.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(()=> res.redirect("/"));
};
