const express = require("express");
const appointmentrouter = express.Router();
const { addAppointment } = require("./controller");

appointmentrouter.post("/add", addAppointment);

module.exports = { appointmentrouter };
