const mongoose = require('mongoose');

const kegiatanSchema = new mongoose.Schema({

  organisasi: {
    type: String,
    required: true
  },

  judul: {
    type: String,
    required: true
  },

  deskripsi: {
    type: String,
    required: true
  },

  tanggal: {
    type: String
  },

  gambar: {
    type: [String],
    default: []
  }

}, {
  timestamps: true
});

module.exports =
mongoose.model(
  'Kegiatan',
  kegiatanSchema
);