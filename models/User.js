const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  nama: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  foto: {
    type: String,
    default: '/logo.png'
  }

});

module.exports = mongoose.model('User', userSchema);