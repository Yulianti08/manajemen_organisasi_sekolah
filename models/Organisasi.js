const mongoose = require('mongoose');

const organisasiSchema = new mongoose.Schema({

  nama: {
    type: String,
    required: true
  },

  deskripsi: {
    type: String,
    required: true
  },

  gambar: {
    type: String,
    required: true
  }

});

module.exports =
mongoose.model(
  'Organisasi',
  organisasiSchema
);