const mongoose = require('mongoose');

const pendaftaranSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nama: String,
    email: String,
    kelas: String,
    jurusan: String,
    organisasi: String,
    alasan: String,

    status: {
      type: String,
      default: 'pending' // ✅ WAJIB kecil
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pendaftaran', pendaftaranSchema);