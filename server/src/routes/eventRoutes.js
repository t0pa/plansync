import express from "express";
import { getAllEvents, createEvent, deleteEvent, getById } from "../controllers/eventController.js";

const router = express.Router();
router.get("/:id", getById);
router.get("/", getAllEvents);
router.post("/", authenticate, createEvent);
router.delete("/:id", deleteEvent); 

export default router;
