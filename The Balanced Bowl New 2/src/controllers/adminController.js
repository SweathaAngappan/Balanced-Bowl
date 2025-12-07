const User = require('../models/User');
const Dietician = require('../models/Dietician');
const Appointment = require('../models/Appointment');

exports.dashboard = async (req, res) => {
  // admin only (middleware expected)
  const users = await User.find().lean();
  const dieticians = await Dietician.find().populate('user').lean();
  const appointments = await Appointment.find().lean();
  res.render('admin/admin-dashboard', { users, dieticians, appointments });
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.session.success = 'User removed';
    res.redirect('/admin');
  } catch (err) {
    req.session.error = 'Error removing user';
    res.redirect('/admin');
  }
};
