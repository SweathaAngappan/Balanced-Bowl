const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

const ensureLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) return next();
  req.session.error = 'Please login first';
  res.redirect('/login');
};

router.get('/register', auth.showRegister);
router.post('/register', auth.register);
router.get('/login', auth.showLogin);
router.post('/login', auth.login);
router.post('/logout', auth.logout);

// profile
router.get('/profile', ensureLoggedIn, auth.showProfile);

module.exports = router;
