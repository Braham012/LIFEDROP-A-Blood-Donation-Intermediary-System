const express = require("express");
const { createDonation } = require("./controller");
const recordrouter = express.Router();

recordrouter.post("/create", createDonation);

module.exports = { recordrouter };
