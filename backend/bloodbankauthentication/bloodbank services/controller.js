const jwt = require("jsonwebtoken");
const { Appointment } = require("../../services/appointment form/model");
const { bloodbank } = require("../model/model");
const { Donation } = require("../../services/donationrecord form/model");

const key = process.env.SECRET_KEY;

async function getAllAppointments(req, res) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, key);
    const bloodBankName = decoded.Bloodbank;

    if (!bloodBankName) {
      return res
        .status(400)
        .json({ success: false, message: "Blood bank not found in token" });
    }

    const BloodBank = await bloodbank.findOne({ bloodbankname: bloodBankName });
    if (!BloodBank) {
      return res
        .status(404)
        .json({ success: false, message: "Blood bank not found in database" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const appointments = await Appointment.find({
      location: BloodBank._id,
      preferredDate: {
        $gte: yesterday, // include yesterday for "done"
        $lte: sevenDaysLater, // upcoming within 7 days
      },
    }).sort({ preferredDate: 1 }); // sort by date ascending

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function getRecentDonations(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Decode token
    let decoded;
    try {
      decoded = jwt.verify(token, key);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const bloodBankName = decoded.Bloodbank;
    if (!bloodBankName) {
      return res
        .status(400)
        .json({ success: false, message: "Blood bank not found in token" });
    }

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const donations = await Donation.find({
      bloodBankName: { $regex: `^${bloodBankName.trim()}$`, $options: "i" },
      date: { $gte: sevenDaysAgo, $lte: today },
    }).sort({ date: -1 });

    if (!donations || donations.length === 0) {
      return res.status(200).json({
        success: true,
        donations: [],
        message: "No donations in last 7 days",
      });
    }

    res.status(200).json({ success: true, donations });
  } catch (error) {
    console.error("Error fetching recent donations:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching donations" });
  }
}

module.exports = { getAllAppointments, getRecentDonations };
