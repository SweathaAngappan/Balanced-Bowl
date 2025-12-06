const User = require('../models/User');
const Dietician = require('../models/Dietician');
const Review = require('../models/Review');

exports.list = async (req, res) => {
  const { q, specialization } = req.query;
  const filter = {};
  // simple search by name via related User
  if (q) filter['user.name'] = new RegExp(q, 'i');
  // load dieticians with user info
  const dieticians = await Dietician.find().populate('user').lean();
  res.render('dietician-list', { dieticians, query: req.query });
};

exports.showProfile = async (req, res) => {
  const dietician = await Dietician.findById(req.params.id).populate('user').lean();
  if (!dietician) return res.status(404).send('Not found');
  const reviews = await Review.find({ dietician: dietician._id }).populate('user').lean();
  res.render('dietician-profile', { dietician, reviews });
};

// (extra) Endpoint for dieticians to claim or create their profile - left simple
exports.createProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      req.session.error = 'Login to create profile';
      return res.redirect('/login');
    }
    const { specialization, experienceYears, fee, consultationModes } = req.body;
    const existing = await Dietician.findOne({ user: req.session.user.id });
    if (existing) {
      req.session.error = 'Profile already exists';
      return res.redirect('/dashboard');
    }
    const d = new Dietician({
      user: req.session.user.id,
      specialization: (specialization || '').split(',').map(s => s.trim()),
      experienceYears,
      consultationModes: (consultationModes || 'online').split(','),
      fee
    });
    await d.save();
    req.session.success = 'Dietician profile created';
    res.redirect('/dieticians');
  } catch (err) {
    console.error(err);
    req.session.error = 'Failed to create profile';
    res.redirect('/dashboard');
  }
};
