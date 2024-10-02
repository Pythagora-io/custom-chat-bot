const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./middleware/authMiddleware');
const User = require('../models/User');
const Chatbot = require('../models/Chatbot');

router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('chatbots');
    const chatbots = user.chatbots.map(chatbot => {
      return {
        _id: chatbot._id,
        name: chatbot.name,
        personalityTraits: chatbot.personalityTraits,
        responsePattern: chatbot.responsePattern,
        country: chatbot.country,
        greeting: chatbot.greeting,
        farewell: chatbot.farewell,
        contextQuestions: chatbot.contextQuestions,
        location: chatbot.location,
        primaryColor: chatbot.primaryColor,
        secondaryColor: chatbot.secondaryColor,
        textColor: chatbot.textColor
      };
    });
    console.log('Chatbots being sent to dashboard:', JSON.stringify(chatbots, null, 2));
    res.render('dashboard', { chatbots, apiKey: user.apiKey });
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    console.error(error.stack);
    res.status(500).send('An error occurred while fetching chatbots');
  }
});

router.post('/dashboard/create-chatbot', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.session.userId);

    console.log('Creating new chatbot with name:', name);

    const newChatbot = new Chatbot({
      name: name,
      user: user._id
    });

    console.log('New chatbot instance created:', newChatbot);

    await newChatbot.save();

    console.log('Chatbot saved successfully:', newChatbot);

    user.chatbots.push(newChatbot._id);
    await user.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error creating new chatbot:', error);
    console.error(error.stack);
    res.status(500).send('An error occurred while creating a new chatbot');
  }
});

router.post('/dashboard/delete-chatbot/:id', isAuthenticated, async (req, res) => {
  console.log('Delete chatbot route triggered');
  try {
    const chatbotId = req.params.id;
    const user = await User.findById(req.session.userId);

    // Remove the chatbot from the user's chatbots array
    user.chatbots = user.chatbots.filter(id => id.toString() !== chatbotId);
    await user.save();

    // Delete the chatbot
    await Chatbot.findByIdAndDelete(chatbotId);

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    console.error(error.stack);
    res.status(500).send('An error occurred while deleting the chatbot');
  }
});

router.post('/dashboard/update-chatbot/:id', isAuthenticated, async (req, res) => {
  try {
    const chatbotId = req.params.id;
    const { name } = req.body;
    await Chatbot.findByIdAndUpdate(chatbotId, { name });
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error updating chatbot name:', error);
    console.error(error.stack);
    res.status(500).send('An error occurred while updating the chatbot name');
  }
});

router.post('/dashboard/clone-chatbot/:id', isAuthenticated, async (req, res) => {
  try {
    const originalChatbot = await Chatbot.findById(req.params.id);
    if (!originalChatbot) {
      return res.status(404).send('Original chatbot not found');
    }

    const clonedChatbot = new Chatbot({
      name: `Copy of ${originalChatbot.name}`,
      user: req.session.userId,
      personalityTraits: originalChatbot.personalityTraits,
      responsePattern: originalChatbot.responsePattern,
      country: originalChatbot.country,
      greeting: originalChatbot.greeting,
      farewell: originalChatbot.farewell,
      contextQuestions: originalChatbot.contextQuestions,
      originalChatbotId: originalChatbot._id
    });

    await clonedChatbot.save();

    const user = await User.findById(req.session.userId);
    user.chatbots.push(clonedChatbot._id);
    await user.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error cloning chatbot:', error);
    console.error(error.stack);
    res.status(500).send('An error occurred while cloning the chatbot');
  }
});

router.post('/chatbot/customize/:id/update-name', isAuthenticated, async (req, res) => {
  try {
    const chatbotId = req.params.id;
    const { name } = req.body;
    await Chatbot.findByIdAndUpdate(chatbotId, { name });
    res.redirect(`/chatbot/customize/${chatbotId}`);
  } catch (error) {
    console.error('Error updating chatbot name:', error);
    console.error(error.stack);
    res.status(500).send('An error occurred while updating the chatbot name');
  }
});

router.post('/dashboard/update-theme/:id', isAuthenticated, async (req, res) => {
  try {
    const chatbotId = req.params.id;
    const { primaryColor, secondaryColor, textColor } = req.body;
    await Chatbot.findByIdAndUpdate(chatbotId, { primaryColor, secondaryColor, textColor });
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error updating chatbot theme:', error);
    console.error(error.stack);
    res.status(500).send('An error occurred while updating the chatbot theme');
  }
});

module.exports = router;