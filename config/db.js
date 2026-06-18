const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/organisasi_sekolah');
    console.log('MongoDB connected');
  } catch (error) {
    console.log('MongoDB error:', error);
  }
};

module.exports = connectDB;