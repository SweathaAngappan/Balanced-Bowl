const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');

// simple admin-check middleware
const adminOnly = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') return next();
  req.session.error = 'Admins only';
  res.redirect('/');
};

router.get('/', adminOnly, admin.dashboard);
router.post('/delete-user/:id', adminOnly, admin.deleteUser);

module.exports = router;
