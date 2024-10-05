const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('./middleware/authMiddleware');

router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('profile', { user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    console.error(error.stack);
    res.status(500).send('An error occurred while fetching the user profile');
  }
});

router.post('/profile/update-api-key', isAuthenticated, async (req, res) => {
  try {
    const { openaiApiKey } = req.body;
    await User.findByIdAndUpdate(req.session.userId, { openaiApiKey });
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating OpenAI API key:', error);
    console.error(error.stack);
    res.status(500).send('An error occurred while updating the OpenAI API key');
  }
});

module.exports = router;