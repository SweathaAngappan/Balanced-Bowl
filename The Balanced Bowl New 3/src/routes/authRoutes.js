const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const upload = require('../middleware/upload');

const ensureLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) return next();
  req.session.error = 'Please login first';
  res.redirect('/login');
};

router.get('/register', auth.showRegister);

// ⭐ ADD MULTER HERE
router.post('/register', upload.array('d_certificates'), auth.register);

router.get('/login', auth.showLogin);
router.post('/login', auth.login);
router.post('/logout', auth.logout);

// profile
router.get('/profile', ensureLoggedIn, auth.showProfile);

module.exports = router;
