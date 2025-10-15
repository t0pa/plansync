import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description } = req.body;
    const adminToken=crypto.randomUUID();
    const newEvent = await prisma.event.create({
      data: { title, description },
    });
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
console.error(error);
    if (error.code === "P2025") {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.status(500).json({ error: error.message });
    }   }
};