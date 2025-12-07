// controllers/authController.js
const User = require('../models/User');
const Dietician = require('../models/Dietician');

// Show registration/login pages
exports.showRegister = (req, res) => res.render('register');
exports.showLogin = (req, res) => res.render('login');

// -------------------- REGISTER --------------------
exports.register = async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      password,

      // USER fields
      u_phone,
      u_age,
      u_height,
      u_weight,
      u_bio,

      // DIETICIAN fields
      d_phone,
      d_specialization,
      d_experienceYears,
      d_fee,
      d_modes,
      d_bio
    } = req.body;

    // Basic user data
    const userData = { role, name, email, password };

    if (role === "user") {
      userData.phone = u_phone || "";
      userData.age = u_age ? Number(u_age) : null;
      userData.height = u_height ? Number(u_height) : null;
      userData.weight = u_weight ? Number(u_weight) : null;
      userData.bio = u_bio || "";
    }

    if (role === "dietician") {
      userData.phone = d_phone || "";
      userData.bio = d_bio || "";
    }

    // Create main user
    const createdUser = await User.create(userData);

    // ------------------ DIETICIAN: CREATE PROFILE ------------------
    if (role === "dietician") {
      
      // ⭐ Extract certificate files uploaded by multer
      const certificateFiles = req.files
        ? req.files.map(f => `/uploads/certificates/${f.filename}`)
        : [];

      const dieticianDoc = new Dietician({
        user: createdUser._id,
        certificates: certificateFiles,  // ⭐ FILE PATHS STORED HERE
        specialization: d_specialization
          ? d_specialization.split(",").map(s => s.trim())
          : [],
        experienceYears: d_experienceYears
          ? Number(d_experienceYears)
          : 0,
        fee: d_fee ? Number(d_fee) : 0,
        consultationModes: d_modes
          ? d_modes.split(",").map(s => s.trim())
          : []
      });

      await dieticianDoc.save();

      // Store session
      req.session.user = {
        id: createdUser._id,
        name: createdUser.name,
        role: createdUser.role
      };

      req.session.success = "Dietician registration successful!";
      return res.redirect("/profile");
    }

    // ------------------ REGULAR USER ------------------
    req.session.user = {
      id: createdUser._id,
      name: createdUser.name,
      role: createdUser.role,
      height: createdUser.height,
      weight: createdUser.weight
    };

    req.session.success = "User registration successful!";
    res.redirect("/user/profile");

  } catch (err) {
    console.error("REGISTRATION ERROR:", err);
    req.session.error = "Registration failed. Please try again.";
    res.redirect("/register");
  }
};

// -------------------- LOGIN --------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      req.session.error = 'Invalid credentials';
      return res.redirect('/login');
    }
    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role,
      height: user.height, // ensures BMI works on login
      weight: user.weight
    };
    req.session.success = `Welcome back, ${user.name}!`;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.session.error = 'Login error';
    res.redirect('/login');
  }
};

// -------------------- LOGOUT --------------------
exports.logout = (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};

// -------------------- SHOW PROFILE --------------------
exports.showProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      req.session.error = 'Login to view profile';
      return res.redirect('/login');
    }

    const dbUser = await User.findById(req.session.user.id).lean();
    if (!dbUser) {
      req.session.error = 'User not found';
      return res.redirect('/');
    }

    // Helper functions for BMI
    function calculateBMI(weight, height) {
      if (!weight || !height) return null;
      const h = Number(height) / 100; // cm → m
      const w = Number(weight);
      if (!h || !w || h === 0) return null;
      return (w / (h * h)).toFixed(1);
    }

    function determineStatus(bmi) {
      if (!bmi) return "No data";
      const n = parseFloat(bmi);
      if (n < 18.5) return "Underweight — Gotta improve! 💛";
      if (n < 25)   return "Healthy — Looking good! 💚";
      if (n < 30)   return "Overweight — Keep working! 🧡";
      return "Obese — We can fix this together! ❤️";
    }

    // Dietician profile
    if (dbUser.role === 'dietician') {
      const dietician = await Dietician.findOne({ user: dbUser._id }).lean();
      if (!dietician) {
        req.session.error = 'Dietician profile not found';
        return res.redirect('/');
      }
      return res.render('dietician-profile', { 
        user: dbUser,
        dietician,
        reviews: [],
        loggedInRole: dbUser.role 
      });
    }

    // Regular user profile
    const bmi = calculateBMI(dbUser.weight, dbUser.height);
    const status = determineStatus(bmi);

    return res.render('user-profile', {
      user: dbUser,
      bmi,
      status,
      loggedInRole: dbUser.role
    });

  } catch (err) {
    console.error('PROFILE ERROR:', err);
    req.session.error = 'Cannot load profile';
    res.redirect('/');
  }

  const Story = require('../models/Story'); // add at top

// inside showProfile before res.render for regular users:
const stories = await Story.find({}).sort({ createdAt: -1 }).lean();

return res.render('user-profile', {
  user: dbUser,
  bmi,
  status,
  loggedInRole: dbUser.role,
  stories   // pass stories to EJS
});

};
