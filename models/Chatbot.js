const mongoose = require('mongoose');
const crypto = require('crypto');

const chatbotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personalityTraits: [String],
  responsePattern: String,
  country: String,
  greeting: String,
  farewell: String,
  contextQuestions: [{
    question: String,
    answer: String
  }],
  uniqueId: {
    type: String,
    unique: true,
    required: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  originalChatbotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot' },
  location: { type: String, enum: ['left', 'right'], default: 'right' },
  primaryColor: { type: String, default: '#007bff' },
  secondaryColor: { type: String, default: '#6c757d' },
  textColor: { type: String, default: '#ffffff' },
});

module.exports = mongoose.model('Chatbot', chatbotSchema);