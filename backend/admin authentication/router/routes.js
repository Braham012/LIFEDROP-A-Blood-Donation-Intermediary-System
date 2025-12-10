const express = require("express");
const { adminlogin, adminlogout } = require("../controller/controller");
const {
  getallbloodbank,
  getallpendingbloodbank,
  getalldonor,
  getRecentEmergencyRequests,
  getRecentFeedback,
  handlePendingAction,
} = require("../admin services/controller");
const { adminAuth } = require("../middleware/middleware");

const Adminrouter = express.Router();

Adminrouter.post("/login", adminlogin);
Adminrouter.post("/logout", adminlogout);
Adminrouter.get("/verify", adminAuth, (req, res) => {
  res.status(200).json({
    success: true,
    user: { role: "Admin" },
  });
});
Adminrouter.get("/services/getallbloodbank", getallbloodbank);
Adminrouter.get("/services/getallpendingbloodbank", getallpendingbloodbank);
Adminrouter.get("/services/getalldonor", getalldonor);
Adminrouter.get("/services/getallemergencyrequest", getRecentEmergencyRequests);
Adminrouter.get("/services/getallfeedback", getRecentFeedback);
Adminrouter.post("/services/pendingbloodbank/:id", handlePendingAction);

module.exports = { Adminrouter };
