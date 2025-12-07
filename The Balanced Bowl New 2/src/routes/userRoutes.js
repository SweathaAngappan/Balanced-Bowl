const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const ensureLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) return next();
  req.session.error = "Please login first";
  res.redirect('/login');
};

// User profile
router.get('/profile', ensureLoggedIn, userController.profile);

// Edit health page
router.get('/edit-health', ensureLoggedIn, userController.editHealthPage);

// Update health info
router.post('/edit-health', ensureLoggedIn, userController.updateHealth);

module.exports = router;
