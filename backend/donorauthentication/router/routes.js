const express = require("express");
const {
  registerdonor,
  verifydonorotp,
  resendverificationotp,
  logindonorbypassword,
  logindonorwithotp,
  verifyloginotp,
  resendloginotp,
  forgetpassword,
  verifyforgotpassword,
  resendresetotp,
  resetpassword,
  logoutdonor,
} = require("../controller/controller");
const {
  getallbloodbank,
  donationrecords,
} = require("../donor services/controller");
const { authenticateToken } = require("../middleware/tokencheck");

const Donorrouter = express.Router();

Donorrouter.post("/registration", registerdonor);
Donorrouter.post("/verification", verifydonorotp);
Donorrouter.post("/resendotp", resendverificationotp);
Donorrouter.post("/login", logindonorbypassword);
Donorrouter.post("/loginwithotp", logindonorwithotp);
Donorrouter.post("/verifylogin", verifyloginotp);
Donorrouter.post("/resendloginotp", resendloginotp);
Donorrouter.post("/forgotpassword", forgetpassword);
Donorrouter.post("/verifyforgotpassword", verifyforgotpassword);
Donorrouter.post("/resendforgototp", resendresetotp);
Donorrouter.patch("/resetpassword", resetpassword);
Donorrouter.post("/logout", logoutdonor);
Donorrouter.get("/services/getallbloodbank", getallbloodbank);
Donorrouter.get("/services/records", donationrecords);
Donorrouter.get("/verify", authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { Donorrouter };
