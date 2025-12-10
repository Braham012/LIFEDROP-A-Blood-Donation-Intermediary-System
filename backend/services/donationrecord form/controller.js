const { Donation } = require("./model");

async function createDonation(req, res) {
  try {
    const {
      donorName,
      email,
      phoneNumber,
      bloodType,
      date,
      units,
      bloodBankName,
    } = req.body;

    if (
      !donorName ||
      !email ||
      !phoneNumber ||
      !bloodType ||
      !date ||
      !units ||
      !bloodBankName
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const donation = new Donation({
      donorName,
      email,
      phoneNumber,
      bloodType,
      date,
      units,
      bloodBankName,
    });

    await donation.save();

    return res
      .status(201)
      .json({ message: "Donation added successfully", donation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
}

module.exports = { createDonation };
