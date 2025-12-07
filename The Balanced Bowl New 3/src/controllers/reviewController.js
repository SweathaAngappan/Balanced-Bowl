const Review = require('../models/Review');
const Dietician = require('../models/Dietician');
const User = require('../models/User'); // needed to get dietician email
const transporter = require('../utils/mailer'); 

// Add a review for a dietician
exports.addReview = async (req, res) => {
  try {
    const dieticianId = req.params.dieticianId;
    const { rating, comment } = req.body;

    if (!req.session?.user) {
      req.session.error = 'Please login to submit a review';
      return res.redirect(`/dieticians/${dieticianId}`);
    }

    const dietician = await Dietician.findById(dieticianId);
    if (!dietician) return res.status(404).send('Dietician not found');

    const review = new Review({
      user: req.session.user.id,
      dietician: dieticianId,
      rating,
      comment
    });

    await review.save();

    // Update average rating and review count
    const stats = await Review.aggregate([
      { $match: { dietician: dietician._id } },
      { $group: { _id: '$dietician', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      dietician.rating = stats[0].avgRating;
      dietician.reviewsCount = stats[0].count;
      await dietician.save();
    }

    // ---------- Send email notification to dietician ----------
    const dieticianUser = await User.findById(dietician.user); // get dietician's user info
    if (dieticianUser && dieticianUser.email) {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: dieticianUser.email,
        subject: 'New Review Received!',
        html: `
          <p>Hello ${dieticianUser.name},</p>
          <p>You have received a new review from a user:</p>
          <ul>
            <li><strong>Rating:</strong> ${rating} / 5 ⭐</li>
            <li><strong>Comment:</strong> ${comment || 'No comment'}</li>
          </ul>
          <p>Check your profile for more details.</p>
          <p>— The Balanced Bowl Team</p>
        `
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error('❌ Error sending review email:', err);
        else console.log('📧 Review email sent:', info.response);
      });
    }

    req.session.success = 'Review submitted';
    res.redirect(`/dieticians/${dieticianId}`);
  } catch (err) {
    console.error(err);
    req.session.error = 'Failed to submit review';
    res.redirect(`/dieticians/${req.params.dieticianId}`);
  }
};
