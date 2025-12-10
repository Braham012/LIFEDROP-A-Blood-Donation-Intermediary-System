const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    bloodType: {
      type: String,
      required: true,
      enum: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    },
    date: {
      type: Date,
      required: true,
    },
    units: {
      type: Number,
      required: true,
      min: 1,
    },
    bloodBankName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Donation = mongoose.model("Donation", donationSchema, "DonationRecord");

module.exports = { Donation };
