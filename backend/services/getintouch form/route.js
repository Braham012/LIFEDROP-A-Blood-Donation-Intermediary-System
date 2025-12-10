const express = require("express");
const submitrouter = express.Router();
const { submitContactForm } = require("./controller");

submitrouter.post("/contact", submitContactForm);

module.exports = { submitrouter };
