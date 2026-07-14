import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";

const router = Router();

// Validation schemas
const createAreaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  siteId: z.string().uuid("Invalid site ID"),
  description: z.string().optional(),
  accessLevel: z.enum(["public", "restricted", "secure"]).default("public"),
  requiresNDA: z.boolean().default(false),
  requiresSafetyBriefing: z.boolean().default(false),
  maxOccupancy: z.number().optional(),
});

const updateAreaSchema = createAreaSchema.partial();

// Access log for tracking area access
interface AccessLogEntry {
  id: string;
  areaId: string;
  areaName: string;
  visitorId?: string;
  visitorName?: string;
  visitId?: string;
  accessGranted: boolean;
  reason?: string;
  timestamp: Date;
}

const accessLogs: AccessLogEntry[] = [];

// Helper to create access log entry
function logAccess(data: Omit<AccessLogEntry, "id" | "timestamp">) {
  const entry: AccessLogEntry = {
    id: `access-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    timestamp: new Date(),
  };
  accessLogs.unshift(entry);
  
  // Keep only last 5000 entries in memory
  if (accessLogs.length > 5000) {
    accessLogs.pop();
  }
  
  return entry;
}

// In-memory area storage (in production, this would be in the database)
let areas: any[] = [
  {
    id: "area-1",
    name: "Reception",
    siteId: "demo-site-id",
    description: "Main reception area",
    accessLevel: "public",
    requiresNDA: false,
    requiresSafetyBriefing: false,
    maxOccupancy: 50,
  },
  {
    id: "area-2",
    name: "Office Floor",
    siteId: "demo-site-id",
    description: "Main office area",
    accessLevel: "restricted",
    requiresNDA: true,
    requiresSafetyBriefing: false,
    maxOccupancy: 100,
  },
  {
    id: "area-3",
    name: "Factory Floor",
    siteId: "demo-site-id",
    description: "Manufacturing area",
    accessLevel: "secure",
    requiresNDA: true,
    requiresSafetyBriefing: true,
    maxOccupancy: 75,
  },
  {
    id: "area-4",
    name: "Server Room",
    siteId: "demo-site-id",
    description: "IT infrastructure area",
    accessLevel: "secure",
    requiresNDA: true,
    requiresSafetyBriefing: false,
    maxOccupancy: 5,
  },
];

// Get all areas
router.get("/", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.query;

    let filteredAreas = areas;
    if (siteId) {
      filteredAreas = areas.filter((a) => a.siteId === siteId);
    }

    res.json({ success: true, data: filteredAreas });
  } catch (error) {
    console.error("Error fetching areas:", error);
    res.status(500).json({ success: false, error: "Failed to fetch areas" });
  }
});

// Get area by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const area = areas.find((a) => a.id === id);

    if (!area) {
      return res.status(404).json({ success: false, error: "Area not found" });
    }

    res.json({ success: true, data: area });
  } catch (error) {
    console.error("Error fetching area:", error);
    res.status(500).json({ success: false, error: "Failed to fetch area" });
  }
});

// Create new area
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = createAreaSchema.parse(req.body);

    const newArea = {
      id: `area-${Date.now()}`,
      ...validatedData,
    };

    areas.push(newArea);

    res.status(201).json({
      success: true,
      data: newArea,
      message: "Area created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error creating area:", error);
    res.status(500).json({ success: false, error: "Failed to create area" });
  }
});

// Update area
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateAreaSchema.parse(req.body);

    const index = areas.findIndex((a) => a.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Area not found" });
    }

    areas[index] = { ...areas[index], ...validatedData };

    res.json({
      success: true,
      data: areas[index],
      message: "Area updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error updating area:", error);
    res.status(500).json({ success: false, error: "Failed to update area" });
  }
});

// Delete area
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = areas.findIndex((a) => a.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: "Area not found" });
    }

    areas.splice(index, 1);

    res.json({ success: true, message: "Area deleted successfully" });
  } catch (error) {
    console.error("Error deleting area:", error);
    res.status(500).json({ success: false, error: "Failed to delete area" });
  }
});

// Check access for a visitor
router.post("/check-access", async (req: Request, res: Response) => {
  try {
    const { areaId, visitorId, visitId } = req.body;

    if (!areaId || !visitorId) {
      return res.status(400).json({
        success: false,
        error: "areaId and visitorId are required",
      });
    }

    const area = areas.find((a) => a.id === areaId);
    if (!area) {
      return res.status(404).json({ success: false, error: "Area not found" });
    }

    // Check visitor access based on area requirements
    const accessChecks = {
      areaName: area.name,
      accessLevel: area.accessLevel,
      requiresNDA: area.requiresNDA,
      requiresSafetyBriefing: area.requiresSafetyBriefing,
      hasAccess: true,
      restrictions: [] as string[],
    };

    // Check if visitor meets requirements
    if (visitId) {
      const visit = await prisma.visit.findUnique({
        where: { id: visitId },
        include: { visitor: true },
      });

      if (visit) {
        if (area.requiresNDA && !visit.ndaSigned) {
          accessChecks.hasAccess = false;
          accessChecks.restrictions.push("NDA not signed");
        }
        if (area.requiresSafetyBriefing && !visit.safetyBriefing) {
          accessChecks.hasAccess = false;
          accessChecks.restrictions.push("Safety briefing not completed");
        }

        // Log access attempt
        logAccess({
          areaId: area.id,
          areaName: area.name,
          visitorId: visit.visitorId,
          visitorName: visit.visitor.name,
          visitId: visit.id,
          accessGranted: accessChecks.hasAccess,
          reason: accessChecks.restrictions.length > 0 ? accessChecks.restrictions.join(", ") : undefined,
        });
      }
    }

    res.json({ success: true, data: accessChecks });
  } catch (error) {
    console.error("Error checking access:", error);
    res.status(500).json({ success: false, error: "Failed to check access" });
  }
});

// Get area occupancy
router.get("/:id/occupancy", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const area = areas.find((a) => a.id === id);

    if (!area) {
      return res.status(404).json({ success: false, error: "Area not found" });
    }

    // In production, you would query the database for current visitors in this area
    const currentOccupancy = 0; // Placeholder

    res.json({
      success: true,
      data: {
        areaId: id,
        areaName: area.name,
        currentOccupancy,
        maxOccupancy: area.maxOccupancy,
        availableSpots: area.maxOccupancy ? area.maxOccupancy - currentOccupancy : null,
      },
    });
  } catch (error) {
    console.error("Error fetching occupancy:", error);
    res.status(500).json({ success: false, error: "Failed to fetch occupancy" });
  }
});

// Get access logs
router.get("/logs/access", async (req: Request, res: Response) => {
  try {
    const { areaId, page = "1", pageSize = "50" } = req.query;

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const skip = (pageNum - 1) * size;

    let filteredLogs = [...accessLogs];
    if (areaId) {
      filteredLogs = filteredLogs.filter((log) => log.areaId === areaId);
    }

    const total = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(skip, skip + size);

    res.json({
      success: true,
      data: {
        data: paginatedLogs,
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    console.error("Error fetching access logs:", error);
    res.status(500).json({ success: false, error: "Failed to fetch access logs" });
  }
});

export default router;
