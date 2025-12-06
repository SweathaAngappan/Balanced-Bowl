const User = require('../models/User');
const Dietician = require('../models/Dietician');
const Review = require('../models/Review');

exports.showRegister = (req, res) => res.render('register');
exports.showLogin = (req, res) => res.render('login');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // USER FIELDS
    const u_phone = req.body.u_phone;
    const u_age = req.body.u_age;
    const u_height = req.body.u_height;
    const u_weight = req.body.u_weight;
    const u_bio = req.body.u_bio; // <-- added this line

    // DIETICIAN FIELDS
    const d_phone = req.body.d_phone;
    const d_certificates = req.body.d_certificates;
    const d_specialization = req.body.d_specialization;
    const d_experienceYears = req.body.d_experienceYears;
    const d_fee = req.body.d_fee;
    const d_modes = req.body.d_modes;

    // Check email exists
    const existing = await User.findOne({ email });
    if (existing) {
      req.session.error = 'Email already used';
      return res.redirect('/register');
    }

    // Create base user
    const user = new User({
      name,
      email,
      password,
      role,
      phone: role === "dietician" ? d_phone : u_phone,
      age: role === "user" ? u_age : null,
      height: role === "user" ? u_height : null,
      weight: role === "user" ? u_weight : null,
      bio: role === "user" ? u_bio : null // <-- save user bio
    });
    await user.save();

    // Create Dietician profile immediately if needed
    if (role === "dietician") {
      await Dietician.create({
        user: user._id,
        certificates: d_certificates ? d_certificates.split(',').map(x => x.trim()) : [],
        specialization: d_specialization ? d_specialization.split(',').map(x => x.trim()) : [],
        experienceYears: d_experienceYears ? Number(d_experienceYears) : 0,
        fee: d_fee ? Number(d_fee) : 500,
        consultationModes: d_modes ? d_modes.split(',').map(x => x.trim()) : ["online"]
      });
    }

    req.session.user = { id: user._id, name: user.name, role: user.role };
    req.session.success = 'Account created successfully!';
    res.redirect('/');
  } catch (err) {
    console.error('Registration error:', err);
    req.session.error = 'Registration failed';
    res.redirect('/register');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      req.session.error = 'Invalid credentials';
      return res.redirect('/login');
    }
    req.session.user = { id: user._id, name: user.name, role: user.role };
    req.session.success = `Welcome back, ${user.name}!`;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.session.error = 'Login error';
    res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};

// Profile page
exports.showProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      req.session.error = 'Login to view profile';
      return res.redirect('/login');
    }

    // Fetch fresh user from DB
    const user = await User.findById(req.session.user.id).lean();
    if (!user) {
      req.session.error = 'User not found';
      return res.redirect('/');
    }

    if (user.role === 'dietician') {
      const dietician = await Dietician.findOne({ user: user._id })
        .populate('user', 'name email phone bio')
        .lean();

      const reviews = await Review.find({ dietician: dietician._id })
        .populate('user', 'name')
        .lean();

      return res.render('dietician-profile', { 
        dietician, 
        reviews, 
        loggedInRole: user.role 
      });
    }

    // Regular user profile
    return res.render('user-profile', { 
      user,
      loggedInRole: user.role
    });

  } catch (err) {
    console.error('Profile error:', err);
    req.session.error = 'Cannot load profile';
    res.redirect('/');
  }
};
