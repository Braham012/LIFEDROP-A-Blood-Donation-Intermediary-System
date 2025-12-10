const jwt = require("jsonwebtoken");

const key = process.env.SECRET_KEY;

const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(token, key);

    req.user = decoded;

    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = { authenticateToken };
