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
    const newEvent = await prisma.event.create({
      data: { title, description },
    });
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
