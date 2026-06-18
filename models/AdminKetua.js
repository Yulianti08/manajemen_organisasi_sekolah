const mongoose = require("mongoose");

const adminKetuaSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  organisasiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organisasi",
    required: true
  }
});

module.exports = mongoose.model("AdminKetua", adminKetuaSchema);