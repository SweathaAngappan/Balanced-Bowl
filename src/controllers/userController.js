// controllers/userController.js
const User = require('../models/User');

// Calculate BMI helper
function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  const h = Number(height) / 100; // cm → m
  const w = Number(weight);
  if (!h || !w || h === 0) return null;
  return (w / (h * h)).toFixed(1);
}

// Determine status
function determineStatus(bmi) {
  if (!bmi) return "No data";
  const n = parseFloat(bmi);

  if (n < 18.5) return "Underweight — Gotta improve! 💛";
  if (n < 25)   return "Healthy — Looking good! 💚";
  if (n < 30)   return "Overweight — Keep working! 🧡";
  return "Obese — We can fix this together! ❤️";
}

exports.profile = async (req, res) => {
  try {
    // defensive session check
    if (!req.session || !req.session.user || !req.session.user._id) {
      req.session && (req.session.error = "Please login first");
      return res.redirect('/login');
    }

    const user = await User.findById(req.session.user._id).lean();

    if (!user) {
      req.session.error = "User not found";
      return res.redirect('/login');
    }

    const bmi = calculateBMI(user.weight, user.height);
    const status = determineStatus(bmi);

    // Always pass these keys (even if null)
    res.render('user-profile', { user, bmi, status });

  } catch (err) {
    console.error('PROFILE ERROR:', err);
    res.redirect('/');
  }
};

exports.editHealthPage = async (req, res) => {
  try {
    if (!req.session || !req.session.user || !req.session.user._id) {
      req.session && (req.session.error = "Please login first");
      return res.redirect('/login');
    }

    const user = await User.findById(req.session.user._id).lean();
    if (!user) {
      req.session.error = "User not found";
      return res.redirect('/login');
    }

    res.render('edit-health', { user });

  } catch (err) {
    console.error('EDIT HEALTH PAGE ERROR:', err);
    res.redirect('/user/profile');
  }
};

exports.updateHealth = async (req, res) => {
  try {
    if (!req.session || !req.session.user || !req.session.user._id) {
      req.session && (req.session.error = "Please login first");
      return res.redirect('/login');
    }

    const { height, weight } = req.body;

    await User.findByIdAndUpdate(req.session.user._id, {
      height: Number(height),
      weight: Number(weight)
    });

    req.session.success = "Health info updated!";
    res.redirect('/user/profile');

  } catch (err) {
    console.error('UPDATE HEALTH ERROR:', err);
    req.session && (req.session.error = "Could not update health info");
    res.redirect('/user/profile');
  }
};
