import jwt from "jsonwebtoken";
import config from "../config.js";
const JWT_SECRET = config.JWT_SECRET;

export const authenticate = (req, res, next) => {
  console.log("Auth middleware called on", req.method, req.path);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("No auth header");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    console.log("Auth successful for user:", req.userId);
    next();
  } catch (err) {
    console.log("Auth failed:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

export default authenticate;
