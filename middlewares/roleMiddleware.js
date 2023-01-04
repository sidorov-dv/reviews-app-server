const jwt = require("jsonwebtoken");

module.exports = function (role) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(403).json({ message: "User not authenticated" });
      }
      const { role: userRole } = jwt.verify(token, process.env.SECRET_JWT);
      if (userRole === role) {
        next();
      } else {
        return res.status(403).json({ message: "You don't have access" });
      }
    } catch (e) {
      return res.status(403).json({ message: "User not authenticated" });
    }
  };
};
