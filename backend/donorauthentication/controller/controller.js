const { user } = require("../model/model");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const bcrypt = require("bcrypt");
const { generateOTP } = require("../../utilis/otpgeneration");
const { transporter } = require("../../utilis/emailgeneration");
const { sendMessage } = require("../../utilis/whatsappsms");
const jwt = require("jsonwebtoken");

const Key = process.env.SECRET_KEY;

async function registerdonor(req, res) {
  try {
    const {
      name,
      age,
      gender,
      email,
      phonenumber,
      password,
      confirmpassword,
      bloodgroup,
      address,
    } = req.body;

    if (
      !name ||
      !age ||
      !gender ||
      !email ||
      !phonenumber ||
      !password ||
      !confirmpassword ||
      !bloodgroup ||
      !address
    ) {
      return res.status(422).json({ message: "All fields are required" });
    }
    if (age <= 18) {
      return res.status(409).json({ message: "Age must be 18+" });
    }
    const emailLower = email.trim().toLowerCase();
    const User = await user.findOne({ email: emailLower });
    if (User) {
      if (User.verified) {
        return res.status(409).json({ message: "Email already exists" });
      } else {
        await user.deleteOne({ email: emailLower });
      }
    }
    const phoneNumber = parsePhoneNumberFromString(phonenumber, "IN");
    if (!phoneNumber || !phoneNumber.isValid()) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }
    const normalizedPhone = phoneNumber.number;
    if (await user.findOne({ phonenumber: normalizedPhone })) {
      return res.status(409).json({ message: "Phone number already exists" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long, include uppercase, lowercase, number, and special character",
      });
    }
    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Password do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailOTP = generateOTP();
    const phoneOTP = generateOTP();
    const hashedEmailOTP = await bcrypt.hash(emailOTP, 10);
    const hashedPhoneOTP = await bcrypt.hash(phoneOTP, 10);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    try {
      await sendMessage(
        normalizedPhone,
        `Your OTP for verification is ${phoneOTP}. It is valid for 5 minutes.`
      );
    } catch (error) {
      console.log("Whatsapp OTP sending Failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send WhatsApp OTP.",
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: emailLower,
      subject: "Email Verification",
      text: `Your OTP for email verification is ${emailOTP}. It is valid for 5 minutes.`,
    });

    const newUser = new user({
      name,
      age,
      gender,
      email: emailLower,
      phonenumber: normalizedPhone,
      password: hashedPassword,
      bloodgroup,
      address,
      emailotp: hashedEmailOTP,
      phoneotp: hashedPhoneOTP,
      otpexpiry: otpExpiry,
    });
    await newUser.save();

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please verify your email and phone number",
    });
  } catch (error) {
    console.log("Registration failed:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
    });
  }
}

async function verifydonorotp(req, res) {
  try {
    const { email, phoneotp, emailotp } = req.body;

    if (!email || !phoneotp || !emailotp) {
      return res.status(400).json({ message: "Please Enter the OTP" });
    }

    const User = await user.findOne({ email });
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }

    if (User.verified == true) {
      return res.status(409).json({ message: "User already verified" });
    }
    if (User.otpexpiry < new Date()) {
      return res.status(410).json({ message: "OTP expired.Try again!" });
    }

    const verifiedemail = await bcrypt.compare(emailotp, User.emailotp);
    const verifiedphone = await bcrypt.compare(phoneotp, User.phoneotp);
    if (!verifiedemail || !verifiedphone) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    User.verified = true;
    User.phoneotp = undefined;
    User.emailotp = undefined;
    User.otpexpiry = undefined;
    await User.save();
    const number = User.phonenumber;
    try {
      await sendMessage(number, `Verfication Successful. You can login now`);
    } catch (error) {
      console.log("Whatsapp sending Failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send message.",
      });
    }

    res
      .status(200)
      .json({ message: "Verification Successful.You can login now." });
  } catch (error) {
    console.log("Error in verifydonorotp:", error);

    return res.status(500).json({
      message: "Verification failed. Please try again later.",
    });
  }
}

async function resendverificationotp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const User = await user.findOne({ email });
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }
    if (User.verified == true) {
      return res.status(409).json({ message: "User already verified" });
    }

    const emailOTP = generateOTP();
    const phoneOTP = generateOTP();
    const hashedEmailOTP = await bcrypt.hash(emailOTP, 10);
    const hashedPhoneOTP = await bcrypt.hash(phoneOTP, 10);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const number = User.phonenumber;
    try {
      await sendMessage(
        number,
        `Your OTP for verification is ${phoneOTP}. It is valid for 5 minutes.`
      );
    } catch (error) {
      console.log("Whatsapp OTP sending Failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send WhatsApp OTP.",
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Resend OTP for Verification",
      text: `Your OTP for email verification is ${emailOTP}. It is valid for 5 minutes.`,
    });

    User.phoneotp = hashedPhoneOTP;
    User.emailotp = hashedEmailOTP;
    User.otpexpiry = otpExpiry;

    await User.save();

    res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
    });
  } catch (error) {
    console.log("Error while resending OTP:", error);

    return res.status(500).json({ message: "Error while sending OTP" });
  }
}

async function logindonorbypassword(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "EMAIL AND PASSWORD ARE REQUIRED" });
    }
    const existinguser = await user.findOne({ email });
    if (!existinguser) {
      return res
        .status(400)
        .json({ message: "User not found, please register first" });
    }

    if (!existinguser.verified == true) {
      return res.status(400).json({ message: "User not verified" });
    }

    const ispassword = await bcrypt.compare(password, existinguser.password);
    if (!ispassword) {
      return res.status(400).json({
        message: "INVALID PASSWORD,TRY AGAIN",
      });
    }
    const token = jwt.sign(
      {
        name: existinguser.name,
        email: existinguser.email,
        bloodgroup: existinguser.bloodgroup,
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

async function logindonorwithotp(req, res) {
  try {
    const { phonenumber, email } = req.body;
    if (!phonenumber && !email) {
      return res
        .status(400)
        .json({ message: "Email or Phone Number is Required" });
    }

    const existingdonor = await user.findOne({
      $or: [{ phonenumber }, { email }],
    });
    if (!existingdonor) {
      return res
        .status(400)
        .json({ message: "User Not Found,Pls Register First" });
    }
    if (!existingdonor.verified == true) {
      return res.status(400).json({ message: "User not verified" });
    }

    const otp = generateOTP();
    const hashedotp = await bcrypt.hash(otp, 10);
    const otpexpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    try {
      await sendMessage(
        existingdonor.phonenumber,
        `Your OTP for Login is ${otp}. It is valid for 5 minutes.`
      );
    } catch (error) {
      console.log("Whatsapp OTP sending Failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send WhatsApp OTP.",
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: existingdonor.email,
      subject: "Login OTP",
      text: `Your OTP for Login is ${otp}. It is valid for 5 minutes.`,
    });

    existingdonor.loginotp = hashedotp;
    existingdonor.loginotpexpiry = otpexpiry;
    await existingdonor.save();

    res.status(200).json({ message: "OTP SENT SUCCESSFULLY" });
  } catch (error) {
    console.log("Error while login with OTP:", error);
    res.status(500).json({ message: "Something Went Wrong,Try again later" });
  }
}

async function verifyloginotp(req, res) {
  try {
    const { phonenumber, email, loginotp } = req.body;
    if ((!phonenumber && !email) || !loginotp) {
      return res.status(400).json({
        message: "Email or Phone Number is Required and OTP is required",
      });
    }
    const existingdonor = await user.findOne({
      $or: [{ phonenumber }, { email }],
    });
    if (!existingdonor) {
      return res
        .status(400)
        .json({ message: "User Not Found,Pls Register First" });
    }
    if (existingdonor.loginotpexpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    const verifiedlogin = await bcrypt.compare(
      loginotp,
      existingdonor.loginotp
    );
    if (!verifiedlogin) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    existingdonor.loginotp = undefined;
    existingdonor.loginotpexpiry = undefined;
    await existingdonor.save();

    const token = jwt.sign(
      {
        name: existingdonor.name,
        email: existingdonor.email,
        bloodgroup: existingdonor.bloodgroup,
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

    res.status(200).json({ message: "Login Successful" });
  } catch (error) {
    console.log("Error while verifying OTP:", error);
    res.status(500).json({ message: "Something went wrong,Try again" });
  }
}

async function resendloginotp(req, res) {
  try {
    const { phonenumber, email } = req.body;
    if (!phonenumber && !email) {
      return res
        .status(400)
        .json({ message: "Email or Phone Number is Required" });
    }
    const existingdonor = await user.findOne({
      $or: [{ phonenumber }, { email }],
    });
    if (!existingdonor) {
      return res
        .status(400)
        .json({ message: "User Not Found,Pls Register First" });
    }

    const otp = generateOTP();
    const hashedotp = await bcrypt.hash(otp, 10);
    const otpexpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    try {
      await sendMessage(
        existingdonor.phonenumber,
        `Your OTP for Login is ${otp}. It is valid for 5 minutes.`
      );
    } catch (error) {
      console.log("Whatsapp OTP sending Failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send WhatsApp OTP.",
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: existingdonor.email,
      subject: "Login OTP",
      text: `Your OTP for Login is ${otp}. It is valid for 5 minutes.`,
    });

    existingdonor.loginotp = hashedotp;
    existingdonor.loginotpexpiry = otpexpiry;
    await existingdonor.save();

    res.status(200).json({ message: "OTP SENT SUCCESSFULLY" });
  } catch (error) {
    console.log("Error while resending OTP", error);
    res.status(500).json({ message: "Something Went Wrong, Try again" });
  }
}

async function forgetpassword(req, res) {
  try {
    const { phonenumber, email } = req.body;
    if (!phonenumber && !email) {
      return res
        .status(400)
        .json({ message: "Email or Phone Number is Required" });
    }
    const existingdonor = await user.findOne({
      $or: [{ phonenumber }, { email }],
    });
    if (!existingdonor) {
      return res
        .status(400)
        .json({ message: "User Not Found,Pls Register First" });
    }
    const otp = generateOTP();
    const hashedotp = await bcrypt.hash(otp, 10);
    const otpexpiry = new Date(Date.now() + 5 * 60 * 1000); //5min

    try {
      await sendMessage(
        existingdonor.phonenumber,
        `Your OTP for Login is ${otp}. It is valid for 5 minutes.`
      );
    } catch (error) {
      console.log("Whatsapp OTP sending Failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send WhatsApp OTP.",
      });
    }

    const resetmail = {
      from: process.env.EMAIL,
      to: existingdonor.email,
      subject: "Forgot Password Verfication",
      text: `Your OTP for verfication is ${otp}.Its valid for 5 minutes.`,
    };

    await transporter.sendMail(resetmail);

    existingdonor.resetotp = hashedotp;
    existingdonor.resetotpexpiry = otpexpiry;
    existingdonor.resetstatus = null;
    existingdonor.save();

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
    const { email, phonenumber, otp } = req.body;
    if ((!email && !phonenumber) || !otp) {
      return res.status(400).json({ message: "OTP is  required" });
    }
    const existingdonor = await user.findOne({
      $or: [{ phonenumber }, { email }],
    });
    if (!existingdonor) {
      return res
        .status(400)
        .json({ message: "User Not Found,Pls Register First" });
    }
    if (existingdonor.resetotpexpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    const verifiedlogin = await bcrypt.compare(otp, existingdonor.resetotp);
    if (!verifiedlogin) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    existingdonor.resetstatus = true;
    existingdonor.resetotp = undefined;
    existingdonor.resetotpexpiry = undefined;
    await existingdonor.save();

    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    console.log("Error while verifing forgot password OTP:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

async function resendresetotp(req, res) {
  try {
    const { email, phonenumber } = req.body;
    if (!email && !phonenumber) {
      return res
        .status(400)
        .json({ message: "Email or Phone Number is required" });
    }

    const existingdonor = await user.findOne({
      $or: [{ phonenumber }, { email }],
    });
    if (!existingdonor) {
      return res
        .status(400)
        .json({ message: "User Not Found,Pls Register First" });
    }
    if (!existingdonor.resetstatus == undefined) {
      return res.status(400).json({ message: "Password reset not initiated" });
    }
    const otp = generateOTP();
    const hashedotp = await bcrypt.hash(otp, 10);
    const otpexpiry = new Date(Date.now() + 5 * 60 * 1000); //5min

    try {
      await sendMessage(
        existingdonor.phonenumber,
        `Your OTP for Login is ${otp}. It is valid for 5 minutes.`
      );
    } catch (error) {
      console.log("Whatsapp OTP sending Failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send WhatsApp OTP.",
      });
    }

    const resetmail = {
      from: process.env.EMAIL,
      to: existingdonor.email,
      subject: "Forgot Password Verfication",
      text: `Your OTP for verfication is ${otp}.Its valid for 5 minutes.`,
    };

    await transporter.sendMail(resetmail);

    existingdonor.resetotp = hashedotp;
    existingdonor.resetotpexpiry = otpexpiry;
    existingdonor.save();

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
    const { email, phonenumber, newpassword, confirmnewpassword } = req.body;
    if ((!email && !phonenumber) || !newpassword || !confirmnewpassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newpassword !== confirmnewpassword) {
      return res.status(400).json({ message: "Password did not match" });
    }

    const existingdonor = await user.findOne({
      $or: [{ phonenumber }, { email }],
    });
    if (!existingdonor) {
      return res
        .status(400)
        .json({ message: "User Not Found,Pls Register First" });
    }
    if (existingdonor.resetstatus == undefined) {
      return res.status(400).json({ message: "Reset Password not initiated" });
    }
    if (!existingdonor.resetstatus == true) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    existingdonor.password = hashedPassword;
    existingdonor.resetstatus = undefined;
    await existingdonor.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error while trying to reset password", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

async function logoutdonor(req, res) {
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
  registerdonor,
  verifydonorotp,
  resendverificationotp,
  logindonorbypassword,
  logindonorwithotp,
  verifyloginotp,
  resendloginotp,
  forgetpassword,
  verifyforgotpassword,
  resendresetotp,
  resetpassword,
  logoutdonor,
};
