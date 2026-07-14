import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";

const router = Router();

// Safety checklist templates
const safetyChecklistTemplates = {
  factory: {
    name: "Factory Safety Briefing",
    description: "Mandatory safety briefing for factory/production areas",
    items: [
      {
        id: "emergency-exits",
        label: "Emergency Exit Locations",
        description: "I understand the locations of all emergency exits",
        required: true,
      },
      {
        id: "assembly-point",
        label: "Assembly Points",
        description: "I know where to gather during an evacuation",
        required: true,
      },
      {
        id: "ppe-requirements",
        label: "PPE Requirements",
        description: "I understand the Personal Protective Equipment requirements",
        required: true,
      },
      {
        id: "restricted-areas",
        label: "Restricted Areas",
        description: "I understand which areas are off-limits",
        required: true,
      },
      {
        id: "hazardous-materials",
        label: "Hazardous Materials",
        description: "I can identify and avoid hazardous materials",
        required: true,
      },
      {
        id: "reporting-procedures",
        label: "Incident Reporting",
        description: "I know how to report safety incidents",
        required: true,
      },
      {
        id: "machinery-safety",
        label: "Machinery Safety",
        description: "I understand machinery safety protocols",
        required: true,
      },
      {
        id: "fire-extinguishers",
        label: "Fire Extinguishers",
        description: "I know the location of fire extinguishers",
        required: false,
      },
    ],
  },
  office: {
    name: "Office Safety Briefing",
    description: "General safety information for office areas",
    items: [
      {
        id: "emergency-exits",
        label: "Emergency Exit Locations",
        description: "I understand the locations of all emergency exits",
        required: true,
      },
      {
        id: "assembly-point",
        label: "Assembly Points",
        description: "I know where to gather during an evacuation",
        required: true,
      },
      {
        id: "fire-extinguishers",
        label: "Fire Extinguishers",
        description: "I know the location of fire extinguishers",
        required: false,
      },
      {
        id: "first-aid",
        label: "First Aid Kits",
        description: "I know where first aid kits are located",
        required: false,
      },
    ],
  },
  serverRoom: {
    name: "Server Room Safety Briefing",
    description: "Safety protocols for server room access",
    items: [
      {
        id: "emergency-exits",
        label: "Emergency Exit Locations",
        description: "I understand the locations of all emergency exits",
        required: true,
      },
      {
        id: "temperature-sensitivity",
        label: "Temperature Sensitivity",
        description: "I understand the temperature-sensitive environment",
        required: true,
      },
      {
        id: "equipment-handling",
        label: "Equipment Handling",
        description: "I know how to safely handle server equipment",
        required: true,
      },
      {
        id: "access-restrictions",
        label: "Access Restrictions",
        description: "I understand access limitations in the server room",
        required: true,
      },
    ],
  },
};

// Get checklist templates
router.get("/templates", async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: safetyChecklistTemplates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ success: false, error: "Failed to fetch templates" });
  }
});

// Get or create safety checklist for a visit
router.get("/visit/:visitId", async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params;

    // Check if checklist already exists
    const existing = await prisma.safetyChecklist.findUnique({
      where: { visitId },
    });

    if (existing) {
      return res.json({ success: true, data: existing });
    }

    // Get visit to determine checklist type
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { site: true },
    });

    if (!visit) {
      return res.status(404).json({ success: false, error: "Visit not found" });
    }

    // Determine checklist type based on site or default to factory
    const checklistType = "factory"; // Could be determined by site settings
    const template = safetyChecklistTemplates[checklistType];

    // Create checklist
    const checklist = await prisma.safetyChecklist.create({
      data: {
        visitId,
        items: template.items.map((item) => ({
          ...item,
          completed: false,
        })),
        completed: false,
      },
    });

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error("Error fetching checklist:", error);
    res.status(500).json({ success: false, error: "Failed to fetch checklist" });
  }
});

// Complete a checklist item
router.post("/visit/:visitId/item/:itemId", async (req: Request, res: Response) => {
  try {
    const { visitId, itemId } = req.params;
    const { completed } = req.body;

    const checklist = await prisma.safetyChecklist.findUnique({
      where: { visitId },
    });

    if (!checklist) {
      return res.status(404).json({ success: false, error: "Checklist not found" });
    }

    const items = checklist.items as any[];
    const updatedItems = items.map((item: any) =>
      item.id === itemId
        ? { ...item, completed, completedAt: completed ? new Date().toISOString() : null }
        : item
    );

    const allRequiredCompleted = updatedItems
      .filter((item: any) => item.required)
      .every((item: any) => item.completed);

    const updatedChecklist = await prisma.safetyChecklist.update({
      where: { visitId },
      data: {
        items: updatedItems,
        completed: allRequiredCompleted,
      },
    });

    // If all required items completed, update visit safety_briefing status
    if (allRequiredCompleted) {
      await prisma.visit.update({
        where: { id: visitId },
        data: { safetyBriefing: true },
      });
    }

    res.json({ success: true, data: updatedChecklist });
  } catch (error) {
    console.error("Error updating checklist item:", error);
    res.status(500).json({ success: false, error: "Failed to update checklist item" });
  }
});

// Complete entire checklist
router.post("/visit/:visitId/complete", async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params;

    const checklist = await prisma.safetyChecklist.findUnique({
      where: { visitId },
    });

    if (!checklist) {
      return res.status(404).json({ success: false, error: "Checklist not found" });
    }

    const items = checklist.items as any[];
    const allRequiredCompleted = items
      .filter((item: any) => item.required)
      .every((item: any) => item.completed);

    if (!allRequiredCompleted) {
      return res.status(400).json({
        success: false,
        error: "Not all required items are completed",
      });
    }

    await prisma.safetyChecklist.update({
      where: { visitId },
      data: { completed: true },
    });

    await prisma.visit.update({
      where: { id: visitId },
      data: { safetyBriefing: true },
    });

    res.json({ success: true, message: "Safety briefing completed" });
  } catch (error) {
    console.error("Error completing checklist:", error);
    res.status(500).json({ success: false, error: "Failed to complete checklist" });
  }
});

export default router;
