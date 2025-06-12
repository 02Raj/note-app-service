const jwt = require("jsonwebtoken");

/**
 * This is the original, simpler middleware provided by the user.
 * It verifies the token and attaches the userId to the request object.
 */
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attaching userId to the request, as per the original code
    req.user = { id: decoded.userId }; // To maintain compatibility with req.user.id
    req.userId = decoded.userId;      // Also keeping req.userId for direct use

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
