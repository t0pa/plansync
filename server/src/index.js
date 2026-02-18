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

app.listen(3000, () => console.log("Server running on port 3000"));
