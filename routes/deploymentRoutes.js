const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./middleware/authMiddleware');
const User = require('../models/User');
const Chatbot = require('../models/Chatbot');
const { isApiKeyValid } = require('../utils/openaiIntegration');

router.get('/deploy/:chatbotId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    console.log('User OpenAI API Key:', user.openaiApiKey ? 'Set' : 'Not set');
    const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, user: user._id });

    if (!chatbot) {
      console.error('Chatbot not found for ID:', req.params.chatbotId);
      return res.status(404).send('Chatbot not found');
    }

    const serverDomain = process.env.SERVER_DOMAIN || req.get('host');
    console.log('Server domain for deployment:', serverDomain);

    const hasApiKey = !!user.openaiApiKey;
    let apiKeyValid = false;

    if (hasApiKey) {
      console.log('Attempting to validate API key');
      apiKeyValid = await isApiKeyValid(user.openaiApiKey);
      console.log('API key validation result:', apiKeyValid);
    }

    res.render('deploy', {
      chatbot,
      apiKey: user.apiKey,
      serverDomain: serverDomain,
      location: chatbot.location,
      primaryColor: chatbot.primaryColor,
      secondaryColor: chatbot.secondaryColor,
      textColor: chatbot.textColor,
      hasApiKey: hasApiKey,
      isApiKeyValid: apiKeyValid
    });
  } catch (error) {
    console.error('Error fetching deployment information:', error);
    console.error(error.stack);
    res.status(500).send('An error occurred while fetching deployment information');
  }
});

router.post('/deploy/:chatbotId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, user: user._id });

    if (!chatbot) {
      console.error('Chatbot not found for ID:', req.params.chatbotId);
      return res.status(404).send('Chatbot not found');
    }

    chatbot.location = req.body.location;
    chatbot.primaryColor = req.body.primaryColor;
    chatbot.secondaryColor = req.body.secondaryColor;
    chatbot.textColor = req.body.textColor;
    await chatbot.save();

    console.log('Chatbot settings updated:', { location: chatbot.location, primaryColor: chatbot.primaryColor, secondaryColor: chatbot.secondaryColor, textColor: chatbot.textColor });

    res.redirect(`/deploy/${chatbot._id}`);
  } catch (error) {
    console.error('Error updating chatbot settings:', error);
    console.error(error.stack);
    res.status(500).send('An error occurred while updating the chatbot settings');
  }
});

module.exports = router;