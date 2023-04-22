const mongoose = require("mongoose");

// 1- Create Schema
const lambsSchema = new mongoose.Schema(
  {
    ecg: {
      type: String,
      trim: true,
    },
    resp: {
      type: String,
      trim: true,
    },
    spo2: {
      type: String,
      trim: true,
    },
    co2: {
      type: String,
      trim: true,
    },
    ibp: {
      type: String,
      trim: true,
    },
    nibp: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Lambs = mongoose.model("Lambs", lambsSchema);

module.exports = Lambs;
