const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log("Entered the middleware");
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization; // Fix case sensitivity

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Decoded User:", req.user);
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = verifyToken;
