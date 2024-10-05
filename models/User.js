const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  chatbots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot' }],
  apiKey: { type: String, unique: true },
  openaiApiKey: { type: String }
});

UserSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      console.error('Error hashing password:', error);
      console.error(error.stack);
      next(error);
    }
  }

  // Generate API key if it doesn't exist
  if (!this.apiKey) {
    this.apiKey = crypto.randomBytes(32).toString('hex');
  }

  next();
});

UserSchema.index({ chatbots: 1 });

const User = mongoose.model('User', UserSchema);

module.exports = User;