const mongoose = require("mongoose");

const bloodbankschema = new mongoose.Schema(
  {
    bloodbankname: {
      type: String,
      required: true,
      unique: true,
    },
    registrationid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phonenumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    maplocation: {
      type: String,
      required: true,
    },
    isapproved: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    remark: {
      type: String,
    },
    resetotp: {
      type: String,
      default: undefined,
    },
    resetotpexpiry: {
      type: Date,
    },
    resetstatus: {
      type: Boolean,
      default: undefined,
    },
  },
  { timestamps: true }
);

const bloodbank = mongoose.model(
  "bloodbank",
  bloodbankschema,
  "BloodbankCredentials"
);

module.exports = { bloodbank };
