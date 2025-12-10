const mongoose = require("mongoose");

const userschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
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
    bloodgroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    address: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    phoneotp: {
      type: String,
    },
    emailotp: {
      type: String,
    },
    otpexpiry: {
      type: Date,
    },
    loginotp: {
      type: String,
      default: undefined,
    },
    loginotpexpiry: {
      type: Date,
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

const user = mongoose.model("user", userschema, "UserCredentials");

module.exports = { user };
