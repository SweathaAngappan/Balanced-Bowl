const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Must be logged in to submit review
const ensureLoggedIn = (req, res, next) => {
  if (req.session?.user) return next();
  req.session.error = 'Please login first';
  res.redirect('/login');
};

// POST review
router.post('/:dieticianId', ensureLoggedIn, reviewController.addReview);

module.exports = router;
