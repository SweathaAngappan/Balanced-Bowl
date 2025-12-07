const express = require('express');
const router = express.Router();
const dieticianController = require('../controllers/dieticianController');

const ensureLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) return next();
  req.session.error = 'Please login first';
  res.redirect('/login');
};

// Self-profile
router.get('/profile', ensureLoggedIn, dieticianController.selfProfile);

// Public profile by ID
router.get('/:id', dieticianController.showProfile);

// List all dieticians
router.get('/', dieticianController.list);

// Create profile (for existing user)
router.post('/create', ensureLoggedIn, dieticianController.createProfile);

module.exports = router;
