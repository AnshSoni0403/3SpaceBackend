const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  message: {
    type: String,
    maxlength: [500, 'Message is too long']
  }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
