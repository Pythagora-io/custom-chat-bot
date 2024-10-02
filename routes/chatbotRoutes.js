console.log('Chatbot routes file loaded');
const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const Chatbot = require('../models/Chatbot');
const User = require('../models/User');
const { generateResponse } = require('../utils/chatbotLogic');

// Add this array of countries at the top of the file
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Congo-Brazzaville)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia (Czech Republic)',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini (fmr. "Swaziland")', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Holy See', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar (formerly Burma)',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia (formerly Macedonia)', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine State', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe'
];

module.exports = function(io) {
  const router = express.Router();
  const conversationHistories = new Map();

  io.on('connection', (socket) => {
    console.log('New Socket.IO connection established. Socket ID:', socket.id);

    const conversationId = socket.handshake.query.conversationId;
    const chatbotId = socket.handshake.query.chatbotId;

    console.log(`Conversation ID: ${conversationId}, Chatbot ID: ${chatbotId}`);

    socket.on('join', (conversationId) => {
      console.log(`Socket ${socket.id} joined conversationId: ${conversationId}`);
      socket.join(conversationId);
    });

    socket.on('chatMessage', async (data) => {
      console.log('Received chat message. Socket ID:', socket.id, 'Chatbot ID:', data.chatbotId, 'Message:', data.message);
      console.log('Full data object:', JSON.stringify(data));

      try {
        let chatbot = await Chatbot.findOne({ uniqueId: data.chatbotId, user: socket.user._id });
        console.log('Found chatbot:', chatbot ? chatbot.name : 'Not found');

        if (!chatbot) {
          console.error(`Chatbot not found for uniqueId: ${data.chatbotId}`);
          throw new Error('Chatbot not found');
        }

        let conversationHistory = conversationHistories.get(data.conversationId) || [];
        conversationHistory.push({ role: 'user', content: data.message });

        const botResponse = await generateResponse(chatbot, data.message, conversationHistory);

        conversationHistory.push({ role: 'assistant', content: botResponse });
        conversationHistories.set(data.conversationId, conversationHistory);

        console.log(`Sending response to conversationId: ${data.conversationId}`);
        io.to(data.conversationId).emit('message', {
          isUser: false,
          message: botResponse
        });
      } catch (error) {
        console.error('Error processing message:', error);
        console.error(error.stack);
        io.to(data.conversationId).emit('message', {
          isUser: false,
          message: "I'm sorry, I encountered an error. Please try again."
        });
      }
    });
  });

  router.get('/customize/:id', isAuthenticated, async (req, res) => {
    try {
      const chatbot = await Chatbot.findOne({ _id: req.params.id, user: req.session.userId });
      if (!chatbot) {
        return res.status(404).send('Chatbot not found');
      }

      // Ensure chatbot has contextQuestions array
      if (!chatbot.contextQuestions) {
        chatbot.contextQuestions = [];
      }

      res.render('chatbotCustomize', { chatbot, countries });
    } catch (error) {
      console.error('Error fetching chatbot:', error);
      res.status(500).send('An error occurred while fetching the chatbot');
    }
  });

  router.post('/customize/:id', isAuthenticated, async (req, res) => {
    console.log('Received POST request for chatbot customization');
    console.log('Request body:', req.body);
    try {
      const chatbot = await Chatbot.findOne({ _id: req.params.id, user: req.session.userId });
      if (!chatbot) {
        return res.status(404).send('Chatbot not found');
      }

      // Server-side validation
      const errors = [];
      if (!req.body.name || req.body.name.trim() === '') {
        errors.push('Please enter a chatbot name.');
      }
      if (!req.body.personalityTraits || req.body.personalityTraits.length === 0) {
        errors.push('Please select at least one personality trait.');
      }
      if (!req.body.responsePattern) {
        errors.push('Please select a response pattern.');
      }
      if (!req.body.country) {
        errors.push('Please select a country.');
      }
      if (!req.body.greeting || req.body.greeting.trim() === '') {
        errors.push('Please enter a greeting.');
      }
      if (!req.body.farewell || req.body.farewell.trim() === '') {
        errors.push('Please enter a farewell.');
      }
      if (!req.body.contextQuestions || req.body.contextQuestions.some(q => !q.question || !q.answer)) {
        errors.push('Please provide answers to all context questions.');
      }

      if (errors.length > 0) {
        console.log('Validation errors:', errors);
        return res.status(400).render('chatbotCustomize', { chatbot, countries, errors });
      }

      chatbot.name = req.body.name.trim();
      chatbot.personalityTraits = req.body.personalityTraits;
      chatbot.responsePattern = req.body.responsePattern;
      chatbot.country = req.body.country;
      chatbot.greeting = req.body.greeting.trim();
      chatbot.farewell = req.body.farewell.trim();
      chatbot.contextQuestions = req.body.contextQuestions.map(q => ({ question: q.question, answer: q.answer }));
      // Theme color updates
      chatbot.primaryColor = req.body.primaryColor;
      chatbot.secondaryColor = req.body.secondaryColor;
      chatbot.textColor = req.body.textColor;
      chatbot.location = req.body.location; // Update chatbot's location based on user selection

      await chatbot.save();
      console.log('Chatbot customization updated successfully');
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error updating chatbot:', error);
      res.status(500).send('An error occurred while updating the chatbot');
    }
  });

  router.get('/test/:id', isAuthenticated, async (req, res) => {
    console.log(`Chatbot test route accessed for ID: ${req.params.id}`);
    try {
      const user = await User.findById(req.session.userId);
      const chatbot = await Chatbot.findOne({ _id: req.params.id, user: req.session.userId });
      if (!chatbot) {
        return res.status(404).send('Chatbot not found');
      }
      res.render('chatbotTest', { chatbot, apiKey: user.apiKey, chatbotUniqueId: chatbot.uniqueId });
    } catch (error) {
      console.error('Error fetching chatbot for testing:', error);
      res.status(500).send('An error occurred while fetching the chatbot for testing');
    }
  });

  router.post('/message/:id', isAuthenticated, async (req, res) => {
    console.log('Received message request for chatbot:', req.params.id);
    console.log('User message:', req.body.message);
    console.log('Current session conversation history:', req.session.conversationHistory); // Added log for conversation history
    try {
      const chatbot = await Chatbot.findOne({ _id: req.params.id, user: req.session.userId });
      if (!chatbot) {
        console.log('Chatbot not found');
        return res.status(404).json({ error: 'Chatbot not found' });
      }

      const userMessage = req.body.message;
      console.log('User message:', userMessage);

      // Reset conversation history if it's a new session (empty message)
      if (!userMessage) {
        req.session.conversationHistory = [];
        console.log('New session detected, conversation history reset');
      }

      // Initialize conversation history if it doesn't exist
      if (!req.session.conversationHistory) {
        req.session.conversationHistory = [];
      }

      console.log('Conversation history length:', req.session.conversationHistory.length);

      const botResponse = await generateResponse(chatbot, userMessage, req.session.conversationHistory);
      console.log('Generated bot response:', botResponse);

      if (io) {
        console.log('Emitting message event:', { isUser: false, message: botResponse });
        io.to(req.params.id).emit('message', {
          isUser: false,
          message: botResponse
        });
      } else {
        console.error('Socket.IO instance not available');
      }

      // Only update conversation history if it's not a new session
      if (userMessage) {
        req.session.conversationHistory.push({ role: "user", content: userMessage });
        req.session.conversationHistory.push({ role: "assistant", content: botResponse });
      }

      res.json({ response: botResponse });
    } catch (error) {
      console.error('Error processing message:', error);
      console.error(error.stack);
      res.status(500).json({ error: 'An error occurred while processing the message' });
    }
  });

  router.use('*', (req, res, next) => {
    console.log(`Catch-all route hit: ${req.originalUrl}`);
    next();
  });

  console.log('Chatbot routes defined');

  return router;
};