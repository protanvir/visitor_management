import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";

const router = Router();

// Validation schemas
const createVisitorTypeSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().optional().default(0),
});

const updateVisitorTypeSchema = createVisitorTypeSchema.partial().omit({ organizationId: true });

// Get all visitor types for an organization
router.get("/", async (req: Request, res: Response) => {
  try {
    const { organizationId, active } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId as string;
    if (active !== undefined) where.active = active === "true";

    const visitorTypes = await prisma.visitorType.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    res.json({ success: true, data: visitorTypes });
  } catch (error) {
    console.error("Error fetching visitor types:", error);
    res.status(500).json({ success: false, error: "Failed to fetch visitor types" });
  }
});

// Get visitor type by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const visitorType = await prisma.visitorType.findUnique({ where: { id } });

    if (!visitorType) {
      return res.status(404).json({ success: false, error: "Visitor type not found" });
    }

    res.json({ success: true, data: visitorType });
  } catch (error) {
    console.error("Error fetching visitor type:", error);
    res.status(500).json({ success: false, error: "Failed to fetch visitor type" });
  }
});

// Create new visitor type
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = createVisitorTypeSchema.parse(req.body);

    // Check for duplicate name within organization
    const existing = await prisma.visitorType.findFirst({
      where: {
        organizationId: validatedData.organizationId,
        name: validatedData.name,
      },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: "Visitor type with this name already exists" });
    }

    const visitorType = await prisma.visitorType.create({ data: validatedData });

    res.status(201).json({
      success: true,
      data: visitorType,
      message: "Visitor type created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error creating visitor type:", error);
    res.status(500).json({ success: false, error: "Failed to create visitor type" });
  }
});

// Update visitor type
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateVisitorTypeSchema.parse(req.body);

    const existing = await prisma.visitorType.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Visitor type not found" });
    }

    // Check for duplicate name if name is being changed
    if (validatedData.name && validatedData.name !== existing.name) {
      const duplicate = await prisma.visitorType.findFirst({
        where: {
          organizationId: existing.organizationId,
          name: validatedData.name,
          id: { not: id },
        },
      });

      if (duplicate) {
        return res.status(400).json({ success: false, error: "Visitor type with this name already exists" });
      }
    }

    const visitorType = await prisma.visitorType.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      data: visitorType,
      message: "Visitor type updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error updating visitor type:", error);
    res.status(500).json({ success: false, error: "Failed to update visitor type" });
  }
});

// Delete visitor type
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.visitorType.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Visitor type not found" });
    }

    await prisma.visitorType.delete({ where: { id } });

    res.json({ success: true, message: "Visitor type deleted successfully" });
  } catch (error) {
    console.error("Error deleting visitor type:", error);
    res.status(500).json({ success: false, error: "Failed to delete visitor type" });
  }
});

// Toggle visitor type active status
router.patch("/:id/toggle", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.visitorType.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Visitor type not found" });
    }

    const visitorType = await prisma.visitorType.update({
      where: { id },
      data: { active: !existing.active },
    });

    res.json({
      success: true,
      data: visitorType,
      message: `Visitor type ${visitorType.active ? "activated" : "deactivated"}`,
    });
  } catch (error) {
    console.error("Error toggling visitor type:", error);
    res.status(500).json({ success: false, error: "Failed to toggle visitor type" });
  }
});

// Public endpoint for kiosk - get active visitor types by organization
router.get("/public/:organizationId", async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    const visitorTypes = await prisma.visitorType.findMany({
      where: {
        organizationId,
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
      },
    });

    res.json({ success: true, data: visitorTypes });
  } catch (error) {
    console.error("Error fetching public visitor types:", error);
    res.status(500).json({ success: false, error: "Failed to fetch visitor types" });
  }
});

export default router;
