const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  picHolder: {
    type: String,
    trim: true,
    default: ''
  },
  picsReceived: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Event', eventSchema);
