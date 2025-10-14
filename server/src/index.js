import express from "express";
import cors from "cors";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/events", eventRoutes);

app.listen(4000, () => console.log("Server running on port 4000"));
