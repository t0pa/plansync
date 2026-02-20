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

export const getById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { user: true }, // This gets the event creator
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    // --- NEW LOGIC TO GET EMAILS ---
    const availData = event.availabilities || [];

    // 1. Get all unique User IDs from the availabilities list
    const participantIds = [...new Set(availData.map((a) => a.userId))];

    // 2. Fetch those users from the database
    const users = await prisma.user.findMany({
      where: { id: { in: participantIds } },
      select: { id: true, email: true }, // Only grab what we need
    });

    // 3. Attach the email to each availability object
    const availabilitiesWithEmails = availData.map((avail) => {
      const userMatch = users.find((u) => u.id === avail.userId);
      return {
        ...avail,
        email: userMatch ? userMatch.email : "Unknown User",
      };
    });

    // 4. Send back the event with the "hydrated" list
    res.json({
      ...event,
      availabilities: availabilitiesWithEmails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
export const createEvent = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        userId: req.userId,
      },
    });

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // From auth middleware

    // Check if event exists and user is the creator
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Only the event creator can delete this event" });
    }

    await prisma.event.delete({ where: { id } });
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// req.userId available from authenticate
export const addAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { slots, name } = req.body; // name optional; use req.userId if needed
    const userId = req.userId;

    if (!Array.isArray(slots))
      return res.status(400).json({ error: "Invalid slots" });

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: "Event not found" });

    // existing availabilities (ensure array)
    const existing = event.availabilities ?? [];
    // remove previous submissions from this user
    const filtered = existing.filter((a) => a.userId !== userId);
    // dedupe slots and ensure consistent array
    const uniqueSlots = Array.from(new Set(slots.map((s) => String(s))));

    // add new submission
    filtered.push({ userId, name: name || userId, times: uniqueSlots });

    const updated = await prisma.event.update({
      where: { id },
      data: { availabilities: filtered },
    });

    res.status(201).json({ availabilities: updated.availabilities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
