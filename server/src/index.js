// Debug: print DATABASE_URL to verify environment variable is loaded
console.log("DATABASE_URL:", process.env.DATABASE_URL);
// src/server.js
import express from "express";
import cors from "cors";
import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// JSON parse error handler - return JSON instead of HTML on bad JSON
app.use((err, req, res, next) => {
  // body-parser throws a SyntaxError when JSON is invalid.
  if (err) {
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }
  next(err);
});

app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
