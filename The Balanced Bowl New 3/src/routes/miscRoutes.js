const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

// GET share-story page
router.get('/share-story', (req, res) => {
  res.render('share-story');   
});

// POST share-story form
router.post('/share-story', async (req, res) => {
  try {
    const { story, name } = req.body;

    await Story.create({
      story,
      name: name || "Anonymous",
      user: req.session.user ? req.session.user.id : null
    });

    req.session.success = "Thank you for sharing your story! 🙌";
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.session.error = "Failed to submit your story.";
    res.redirect('/share-story');
  }
});

module.exports = router;
