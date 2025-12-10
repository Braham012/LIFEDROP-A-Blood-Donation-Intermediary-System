const { bloodbank } = require("../model/model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../../utilis/otpgeneration");
const { transporter } = require("../../utilis/emailgeneration");
const Key = process.env.SECRET_KEY;

async function bloodbankregistration(req, res) {
  try {
    const {
      bloodbankname,
      registrationid,
      email,
      phonenumber,
      password,
      confirmpassword,
      address,
      maplocation,
    } = req.body;

    if (
      !bloodbankname ||
      !registrationid ||
      !email ||
      !phonenumber ||
      !password ||
      !confirmpassword ||
      !address ||
      !maplocation
    ) {
      return res.status(422).json({ message: "All Fields are required" });
    }

    if (await bloodbank.findOne({ bloodbankname: bloodbankname })) {
      return res.status(409).json({ message: "Bloodbank already Registered" });
    }

    if (await bloodbank.findOne({ registrationid: registrationid })) {
      return res.status(409).json({ MESSAGE: "Pls Check Registration ID" });
    }

    if (await bloodbank.findOne({ phonenumber: phonenumber })) {
      return res
        .status(409)
        .json({ message: "Phone Number is alerady Registered" });
    }

    const emaillower = email.trim().toLowerCase();
    const user = await bloodbank.findOne({ email: emaillower });
    if (user) {
      if (user.isapproved === "approved") {
        return res.status(409).json({ message: "Email is already Registered" });
      }
      if (user.isapproved === "pending") {
        return res.status(400).json({
          message:
            "The Application is currently Processing . Pls wait for confirmation Email before trying again",
        });
      } else {
        await bloodbank.deleteOne({ email: emaillower });
      }
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long, include uppercase, lowercase, number, and special character",
      });
    }
    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newbloodbank = new bloodbank({
      bloodbankname,
      registrationid,
      email: emaillower,
      phonenumber,
      password: hashedPassword,
      address,
      maplocation,
      isapproved: "pending",
    });
    await newbloodbank.save();

    res.status(201).json({
      success: true,
      message:
        "Application Submitted. Response will be provided within 2 to 3 working days",
    });
  } catch (error) {
    console.log("Registration failed:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
    });
  }
}

async function bloodbanklogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password is Required" });
    }

    const existinguser = await bloodbank.findOne({ email });
    if (!existinguser) {
      return res.status(400).json({ message: "Email Not Registered" });
    }
    if (existinguser.isapproved === "pending") {
      return res.status(400).json({
        message:
          "Approval is currently pending. Pls wait for the confirmation Email",
      });
    }
    if (existinguser.isapproved === "rejected") {
      return res.status(400).json({ message: "Pls Update Your Application" });
    }

    const passwordcheck = await bcrypt.compare(password, existinguser.password);
    if (!passwordcheck) {
      return res.status(400).json({
        message: "Invalid Password,Try again",
      });
    }

    const token = jwt.sign(
      {
        Bloodbank: existinguser.bloodbankname,
        email: existinguser.email,
        role: "Bloodbank",
      },
      Key,
      { expiresIn: "7D" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 2,
      sameSite: "lax",
      path: "/", // 👈 ensure cookie is available across routes
      domain: "localhost",
    });

    res.status(200).json({ message: "Login Succesful" });
  } catch (error) {
    console.log("Error while Login:", error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
}

async function forgotpassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is Required" });
    }

    const existinguser = await bloodbank.findOne({ email });
    if (!existinguser) {
      return res.status(400).json({ message: "Email Not Registered" });
    }
    if (existinguser.isapproved === "pending") {
      return res.status(400).json({
        message:
          "Approval is currently pending. Pls wait for the confirmation Email",
      });
    }
    if (existinguser.isapproved === "rejected") {
      return res.status(400).json({ message: "Pls Update Your Application" });
    }

    const otp = generateOTP();
    const hashedotp = await bcrypt.hash(otp, 10);
    const otpexpiry = new Date(Date.now() + 5 * 60 * 1000); //5min

    const resetmail = {
      from: process.env.EMAIL,
      to: existinguser.email,
      subject: "Forgot Password Verfication",
      text: `Your OTP for verfication is ${otp}.Its valid for 5 minutes.`,
    };
    await transporter.sendMail(resetmail);

    existinguser.resetotp = hashedotp;
    existinguser.resetotpexpiry = otpexpiry;
    existinguser.resetstatus = null;
    existinguser.save();

    res.status(200).json({
      message: "Check for OTP",
    });
  } catch (error) {
    console.log("Error while processing forgot password:", error.message);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function verifyforgotpassword(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "OTP is  required" });
    }

    const existinguser = await bloodbank.findOne({ email });
    if (!existinguser) {
      return res.status(400).json({ message: "Email Not Registered" });
    }
    if (existinguser.isapproved === "pending") {
      return res.status(400).json({
        message:
          "Approval is currently pending. Pls wait for the confirmation Email",
      });
    }
    if (existinguser.isapproved === "rejected") {
      return res.status(400).json({ message: "Pls Update Your Application" });
    }
    if (existinguser.resetotpexpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const verifiedlogin = await bcrypt.compare(otp, existinguser.resetotp);
    if (!verifiedlogin) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    existinguser.resetstatus = true;
    existinguser.resetotp = undefined;
    existinguser.resetotpexpiry = undefined;
    await existinguser.save();

    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    console.log("Error while verifing forgot password OTP:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

async function resendresetotp(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is Required" });
    }

    const existinguser = await bloodbank.findOne({ email });
    if (!existinguser) {
      return res.status(400).json({ message: "Email Not Registered" });
    }
    if (existinguser.isapproved === "pending") {
      return res.status(400).json({
        message:
          "Approval is currently pending. Pls wait for the confirmation Email",
      });
    }
    if (existinguser.isapproved === "rejected") {
      return res.status(400).json({ message: "Pls Update Your Application" });
    }
    if (!existinguser.resetstatus == undefined) {
      return res.status(400).json({ message: "Password reset not initiated" });
    }

    const otp = generateOTP();
    const hashedotp = await bcrypt.hash(otp, 10);
    const otpexpiry = new Date(Date.now() + 5 * 60 * 1000); //5min

    const resetmail = {
      from: process.env.EMAIL,
      to: existinguser.email,
      subject: "Forgot Password Verfication",
      text: `Your OTP for verfication is ${otp}.Its valid for 5 minutes.`,
    };
    await transporter.sendMail(resetmail);

    existinguser.resetotp = hashedotp;
    existinguser.resetotpexpiry = otpexpiry;
    existinguser.save();

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.log(
      "something went wrong while resending forgot passsword otp:",
      error
    );
    res.status(500).json({ message: "Something went wrong" });
  }
}

async function resetpassword(req, res) {
  try {
    const { email, newpassword, confirmnewpassword } = req.body;
    if (!email || !newpassword || !confirmnewpassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newpassword !== confirmnewpassword) {
      return res.status(400).json({ message: "Password did not match" });
    }

    const existinguser = await bloodbank.findOne({ email });
    if (!existinguser) {
      return res.status(400).json({ message: "Email Not Registered" });
    }
    if (existinguser.isapproved === "pending") {
      return res.status(400).json({
        message:
          "Approval is currently pending. Pls wait for the confirmation Email",
      });
    }
    if (existinguser.isapproved === "rejected") {
      return res.status(400).json({ message: "Pls Update Your Application" });
    }
    if (existinguser.resetstatus == undefined) {
      return res.status(400).json({ message: "Password reset not initiated" });
    }
    if (!existinguser.resetstatus == true) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    existinguser.password = hashedPassword;
    existinguser.resetstatus = undefined;
    await existinguser.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error while trying to reset password", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

async function logoutbloodbank(req, res) {
  try {
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    console.log("Error while logging out:", error);
    res.status(500).json({ message: "Something went Wrong" });
  }
}

module.exports = {
  bloodbankregistration,
  bloodbanklogin,
  forgotpassword,
  verifyforgotpassword,
  resendresetotp,
  resetpassword,
  logoutbloodbank,
};
