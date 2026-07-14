import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";

const router = Router();

// Validation schemas
const createSiteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  timezone: z.string().default("UTC"),
  organizationId: z.string().uuid("Organization ID is required"),
  settings: z
    .object({
      requireNDA: z.boolean().optional(),
      safetyChecklist: z.boolean().optional(),
      maxVisitDuration: z.number().optional(),
    })
    .optional(),
});

const updateSiteSchema = createSiteSchema.partial();

// Get all sites
router.get("/", async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;

    const sites = await prisma.site.findMany({
      where,
      include: {
        _count: {
          select: {
            employees: true,
            visits: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: sites });
  } catch (error) {
    console.error("Error fetching sites:", error);
    res.status(500).json({ success: false, error: "Failed to fetch sites" });
  }
});

// Get site by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        organization: true,
        employees: {
          take: 10,
          orderBy: { name: "asc" },
        },
        _count: {
          select: {
            employees: true,
            visits: true,
          },
        },
      },
    });

    if (!site) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    res.json({ success: true, data: site });
  } catch (error) {
    console.error("Error fetching site:", error);
    res.status(500).json({ success: false, error: "Failed to fetch site" });
  }
});

// Create new site
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = createSiteSchema.parse(req.body);

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: validatedData.organizationId },
    });

    if (!organization) {
      return res.status(400).json({ success: false, error: "Organization not found" });
    }

    const site = await prisma.site.create({
      data: validatedData,
      include: {
        organization: true,
      },
    });

    res.status(201).json({
      success: true,
      data: site,
      message: "Site created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error creating site:", error);
    res.status(500).json({ success: false, error: "Failed to create site" });
  }
});

// Update site
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateSiteSchema.parse(req.body);

    const site = await prisma.site.update({
      where: { id },
      data: validatedData,
      include: {
        organization: true,
      },
    });

    res.json({
      success: true,
      data: site,
      message: "Site updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error updating site:", error);
    res.status(500).json({ success: false, error: "Failed to update site" });
  }
});

// Delete site
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if site has employees or visits
    const [employeeCount, visitCount] = await Promise.all([
      prisma.employee.count({ where: { siteId: id } }),
      prisma.visit.count({ where: { siteId: id } }),
    ]);

    if (employeeCount > 0 || visitCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete site with employees or visits",
      });
    }

    await prisma.site.delete({ where: { id } });

    res.json({ success: true, message: "Site deleted successfully" });
  } catch (error) {
    console.error("Error deleting site:", error);
    res.status(500).json({ success: false, error: "Failed to delete site" });
  }
});

// Get site statistics
router.get("/:id/statistics", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const where: any = { siteId: id };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [totalVisits, visitsByStatus, visitsByType, currentVisitors] = await Promise.all([
      prisma.visit.count({ where }),
      prisma.visit.groupBy({
        by: ["status"],
        where,
        _count: true,
      }),
      prisma.visit.groupBy({
        by: ["visitorType"],
        where,
        _count: true,
      }),
      prisma.visit.count({
        where: {
          siteId: id,
          status: "checked_in",
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalVisits,
        currentVisitors,
        visitsByStatus: visitsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        visitsByType: visitsByType.reduce((acc, item) => {
          acc[item.visitorType] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error("Error fetching site statistics:", error);
    res.status(500).json({ success: false, error: "Failed to fetch site statistics" });
  }
});

export default router;
