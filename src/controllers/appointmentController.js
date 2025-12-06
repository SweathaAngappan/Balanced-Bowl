const Appointment = require('../models/Appointment');
const Dietician = require('../models/Dietician');

exports.bookPage = async (req, res) => {
  const dietician = await Dietician.findById(req.params.id).populate('user').lean();
  if (!dietician) return res.status(404).send('Dietician not found');
  res.render('book', { dietician });
};

exports.create = async (req, res) => {
  try {
    if (!req.session.user) {
      req.session.error = 'You must be logged in to book';
      return res.redirect('/login');
    }
    const { dieticianId, date, mode, notes, payment } = req.body;
    const appt = new Appointment({
      user: req.session.user.id,
      dietician: dieticianId,
      date: new Date(date),
      mode,
      notes,
      paymentConfirmed: payment === 'true'
    });
    await appt.save();
    req.session.success = payment === 'true' ? 'Appointment booked and payment confirmed!' : 'Appointment booked (payment pending)';
    res.redirect('/appointments/my');
  } catch (err) {
    console.error(err);
    req.session.error = 'Failed to book';
    res.redirect('back');
  }
};

exports.myAppointments = async (req, res) => {
  if (!req.session.user) {
    req.session.error = 'Login first';
    return res.redirect('/login');
  }
  const appts = await Appointment.find({ user: req.session.user.id })
    .populate({ path: 'dietician', populate: { path: 'user' } })
    .lean();
  res.render('dashboard', { appts });
};
