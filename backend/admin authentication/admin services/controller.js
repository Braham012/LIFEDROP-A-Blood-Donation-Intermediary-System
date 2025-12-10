const { bloodbank } = require("../../bloodbankauthentication/model/model");
const { user } = require("../../donorauthentication/model/model");
const { Emergency } = require("../../services/emergency form/model");
const { ContactForm } = require("../../services/getintouch form/model");
const { transporter } = require("../../utilis/emailgeneration");

async function getallbloodbank(req, res) {
  try {
    const bank = await bloodbank.find({ isapproved: "approved" });

    res.status(200).json({
      count: bank.length,
      data: bank,
    });
  } catch (error) {
    console.log("error while sending all bloodbank:", error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
}

async function getallpendingbloodbank(req, res) {
  try {
    const bank = await bloodbank.find({ isapproved: "pending" });

    res.status(200).json({
      count: bank.length,
      data: bank,
    });
  } catch (error) {
    console.log("error while sending all bloodbank:", error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
}

async function getalldonor(req, res) {
  try {
    const donors = await user.find({ verified: "true" });

    res.status(200).json({
      donors,
    });
  } catch (error) {
    console.log("error while sending all bloodbank:", error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
}

async function getRecentEmergencyRequests(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const emergencies = await Emergency.find({
      createdAt: { $gte: twoDaysAgo },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });
  } catch (error) {
    console.error("Error fetching emergency requests:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching emergency requests",
    });
  }
}

async function getRecentFeedback(req, res) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const feedbacks = await ContactForm.find({
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      data: feedbacks,
      count: feedbacks.length,
    });
  } catch (error) {
    console.error("Error fetching recent feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent feedback",
    });
  }
}

const handlePendingAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remark } = req.body;

    if (!["accepted", "rejected"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const updated = await bloodbank.findByIdAndUpdate(
      id,
      {
        isapproved: action === "accepted" ? "approved" : "rejected",
        remark: remark || "",
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Bloodbank not found" });

    const mailOptions = {
      from: '"LifeDrop Admin" <your_email@example.com>',
      to: updated.email,
      subject: `Bloodbank Registration ${
        action === "accepted" ? "Approved" : "Rejected"
      }`,
      html: `
        <p>Dear ${updated.bloodbankname},</p>
        <p>Your bloodbank registration has been <strong>${
          action === "accepted" ? "approved" : "rejected"
        }</strong>.</p>
        <p><strong>Remarks:</strong> ${remark}</p>
        <p>Thank you for using LifeDrop.</p>
      `,
    };

    transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: `Bloodbank ${action} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getallbloodbank,
  getallpendingbloodbank,
  getRecentEmergencyRequests,
  getalldonor,
  getRecentFeedback,
  handlePendingAction,
};
