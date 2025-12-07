const User = require('../models/User');
const Dietician = require('../models/Dietician');
const Review = require('../models/Review');

exports.list = async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim() : '';
    let dieticians;

    if (query) {
      const users = await User.find({ 
        name: { $regex: query, $options: 'i' }, 
        role: 'dietician' 
      }).lean();
      const userIds = users.map(u => u._id);

      dieticians = await Dietician.find({ user: { $in: userIds } })
        .populate('user')
        .lean();
    } else {
      dieticians = await Dietician.find({})
        .populate('user')
        .lean();
    }

    // REMOVE orphan dieticians (user deleted)
    dieticians = dieticians.filter(d => d.user);

    res.render('dietician-list', { dieticians, query: req.query });
  } catch (err) {
    console.error('DIETICIAN LIST ERROR:', err);
    req.session.error = 'Cannot load dieticians';
    res.redirect('/');
  }
};

exports.showProfile = async (req, res) => {
  const dietician = await Dietician.findById(req.params.id).populate('user').lean();
  if (!dietician) return res.status(404).send('Not found');
  const reviews = await Review.find({ dietician: dietician._id }).populate('user').lean();
  res.render('dietician-profile', { 
  dietician, 
  reviews,
  loggedInRole: req.session.user ? req.session.user.role : null
});

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

exports.selfProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      req.session.error = "Login to view profile";
      return res.redirect('/login');
    }

    const dbUser = await User.findById(req.session.user.id).lean();
    if (!dbUser) {
      req.session.error = "User not found";
      return res.redirect('/');
    }

    if (dbUser.role !== 'dietician') {
      req.session.error = "You are not a dietician";
      return res.redirect('/');
    }

    const dietician = await Dietician.findOne({ user: dbUser._id }).lean();
    if (!dietician) {
      req.session.error = "Dietician profile not found";
      return res.redirect('/');
    }

    // Render self-profile
    return res.render('dietician-profile', {
      user: dbUser,
      dietician,
      reviews: [], // optional: add reviews later
      loggedInRole: dbUser.role
    });

  } catch (err) {
    console.error("SELF PROFILE ERROR:", err);
    req.session.error = "Cannot load profile";
    res.redirect('/');
  }
};


