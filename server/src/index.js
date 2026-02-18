// src/server.js
import express from "express";
import cors from "cors";
import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
