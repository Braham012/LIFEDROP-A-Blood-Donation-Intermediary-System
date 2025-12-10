const jwt = require("jsonwebtoken");

const AdminUsername = process.env.adminusername;
const AdminPassword = process.env.adminpassword;
const Key = process.env.SECRET_KEY;

async function adminlogin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(422).json({ message: "All Fields are required" });
    }
    if (username !== AdminUsername) {
      return res.status(400).json({ message: "Invalid Username" });
    }
    if (password !== AdminPassword) {
      return res.status(400).json({ message: "Invlid Credentials" });
    }
    const token = jwt.sign({ Role: "Admin" }, Key, { expiresIn: "7D" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 2,
      sameSite: "lax",
      path: "/", //  ensure cookie is available across routes
      domain: "localhost",
    });

    res.status(200).json({ message: "Login Successful" });
  } catch (error) {
    console.log("Error While Admin Login:", error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
}

async function adminlogout(req, res) {
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

module.exports = { adminlogin, adminlogout };
