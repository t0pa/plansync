import express from "express";
import {
  getAllEvents,
  createEvent,
  deleteEvent,
  getById,
  addAvailability,
} from "../controllers/eventController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log("Event route:", req.method, req.originalUrl, req.path);
  next();
});

// More specific routes first
router.post("/:id/availability", authenticate, addAvailability);
router.get("/:id", getById);
router.delete("/:id", authenticate, deleteEvent);

// General routes
router.get("/", getAllEvents);
router.post("/", authenticate, createEvent);

export default router;
