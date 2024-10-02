const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Chatbot = require('../models/Chatbot');
const fs = require('fs');
const path = require('path');

// This is a mock function. In a real application, you would fetch this data from a database or external API.
function getIdiomsForCountry(country) {
  const idioms = {
    'Worldwide': ['The early bird catches the worm', 'Actions speak louder than words'],
    'USA': ['Piece of cake', 'Break a leg', 'Knock on wood'],
    // Add more countries and their idioms here
  };
  return idioms[country] || idioms['Worldwide'];
}

router.get('/idioms', (req, res) => {
  const country = req.query.country || 'Worldwide';
  const idioms = getIdiomsForCountry(country);
  res.json({ idioms });
});

router.get('/chatbot-script', async (req, res) => {
  console.log('Chatbot script requested with params:', req.query);
  const apiKey = req.query.apiKey;
  const chatbotId = req.query.chatbotId;

  if (!apiKey || !chatbotId) {
    console.log('Missing apiKey or chatbotId');
    return res.status(400).json({ error: 'API key and chatbot ID are required' });
  }

  try {
    const user = await User.findOne({ apiKey });
    if (!user) {
      console.log('Invalid API key:', apiKey);
      return res.status(401).json({ error: 'Invalid API key' });
    }
    console.log('User found:', user);

    const chatbot = await Chatbot.findOne({ uniqueId: chatbotId, user: user._id });
    if (!chatbot) {
      console.log('Chatbot not found for ID:', chatbotId);
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    console.log('Chatbot settings before serving script:', {
      location: chatbot.location,
      primaryColor: chatbot.primaryColor,
      secondaryColor: chatbot.secondaryColor,
      textColor: chatbot.textColor
    });

    // Read the chatbot-embed.js file
    const scriptPath = path.join(__dirname, '..', 'public', 'js', 'chatbot-embed.js');
    let script = fs.readFileSync(scriptPath, 'utf8');

    // Inject chatbot settings into the script
    script = script.replace('__API_KEY__', apiKey);
    script = script.replace('__CHATBOT_ID__', chatbotId);
    script = script.replace('__CHATBOT_LOCATION__', chatbot.location || 'right');
    script = script.replace('__PRIMARY_COLOR__', chatbot.primaryColor || '#007bff');
    script = script.replace('__SECONDARY_COLOR__', chatbot.secondaryColor || '#6c757d');
    script = script.replace('__TEXT_COLOR__', chatbot.textColor || '#ffffff');

    console.log('Modified script content:', script);

    // Set the correct content type for JavaScript
    res.setHeader('Content-Type', 'application/javascript');
    res.send(script);
    console.log('Serving chatbot script with injected settings');
  } catch (error) {
    console.error('Error serving chatbot script:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'An error occurred while serving the chatbot script' });
  }
});

module.exports = router;