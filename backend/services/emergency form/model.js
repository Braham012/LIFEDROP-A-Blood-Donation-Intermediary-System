const mongoose = require("mongoose");

const EmergencyRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },

    contact: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    bloodgroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    address: {
      type: String,
      required: true,
    },

    coordinates: {
      type: String,
      required: true,
    },

    needwithin: {
      type: String,
      required: true,
      enum: ["12 Hours", "24 Hours"],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Emergency = mongoose.model(
  "emergency",
  EmergencyRequestSchema,
  "EmergencyRequests"
);

module.exports = { Emergency };
