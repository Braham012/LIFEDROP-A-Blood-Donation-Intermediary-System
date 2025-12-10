const jwt = require("jsonwebtoken");
const key = process.env.SECRET_KEY;

function adminAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(token, key);

    if (decoded.Role !== "Admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized as admin" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("Admin verification failed:", err);
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

module.exports = { adminAuth };
