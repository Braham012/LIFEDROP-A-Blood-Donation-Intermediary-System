const express = require("express");
const { authenticateToken } = require("../middleware/middleware");
const {
  bloodbankregistration,
  bloodbanklogin,
  forgotpassword,
  verifyforgotpassword,
  resendresetotp,
  resetpassword,
  logoutbloodbank,
} = require("../controller/controller");
const {
  getAllAppointments,
  getRecentDonations,
} = require("../bloodbank services/controller");

const bloodbankroute = express.Router();

bloodbankroute.post("/registration", bloodbankregistration);
bloodbankroute.post("/login", bloodbanklogin);
bloodbankroute.post("/forgotpassword", forgotpassword);
bloodbankroute.post("/verify", verifyforgotpassword);
bloodbankroute.post("/resend", resendresetotp);
bloodbankroute.post("/resetpassword", resetpassword);
bloodbankroute.post("/logout", logoutbloodbank);
bloodbankroute.get("/services/getappointment", getAllAppointments);
bloodbankroute.get("/services/getdonation", getRecentDonations);
bloodbankroute.get("/verify", authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { bloodbankroute };
