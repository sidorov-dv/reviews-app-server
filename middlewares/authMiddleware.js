const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(403).json({ message: "User not authenticated" });
    }
    const decodedData = jwt.verify(token, process.env.SECRET_JWT);
    req.user = decodedData;
    next();
  } catch (e) {
    return res.status(403).json({ message: "User not authenticated" });
  }
};
