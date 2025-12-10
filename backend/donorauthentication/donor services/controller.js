const { bloodbank } = require("../../bloodbankauthentication/model/model");
const { Donation } = require("../../services/donationrecord form/model");
const jwt = require("jsonwebtoken");

const key = process.env.SECRET_KEY;

async function getallbloodbank(req, res) {
  try {
    const bank = await bloodbank.find({ isapproved: "approved" });

    res.status(200).json({
      data: bank,
    });
  } catch (error) {
    console.log("error while sending all bloodbank:", error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
}

async function donationrecords(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, key);

    const records = await Donation.find({ email: decoded.email }).sort({
      date: -1,
    });

    res.status(200).json({ success: true, records });
  } catch (error) {
    console.error("Error fetching donation records:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { getallbloodbank, donationrecords };
