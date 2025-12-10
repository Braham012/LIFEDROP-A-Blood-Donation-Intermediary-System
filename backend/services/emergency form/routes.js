const express = require("express");
const emergencyrouter = express.Router();

const { emergencyrequest } = require("./controller");

emergencyrouter.post("/create", emergencyrequest);

module.exports = { emergencyrouter };
