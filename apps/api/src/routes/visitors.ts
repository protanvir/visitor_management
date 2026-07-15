import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";
import { createAuditLog } from "./audit";

const router = Router();

// Generate short alphanumeric visitor code like "V-ABC123"
function generateVisitorCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars (0,O,1,I)
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `V-${code}`;
}

// Validation schemas
const createVisitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

const updateVisitorSchema = createVisitorSchema.partial();

// Get all visitors with pagination and search
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      pageSize = "10",
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      include,
    } = req.query;

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const skip = (pageNum - 1) * size;
    const includeVisits = include === "visits";

    // Build search condition
    const searchCondition = search
      ? {
          OR: [
            { name: { contains: search as string, mode: "insensitive" as const } },
            { email: { contains: search as string, mode: "insensitive" as const } },
            { company: { contains: search as string, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get visitors with pagination
    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where: searchCondition,
        skip,
        take: size,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          _count: {
            select: { visits: true },
          },
          ...(includeVisits ? {
            visits: {
              take: 5,
              orderBy: { createdAt: "desc" },
              include: {
                host: { select: { name: true } },
                site: { select: { name: true } },
              },
            },
          } : {}),
        },
      }),
      prisma.visitor.count({ where: searchCondition }),
    ]);

    res.json({
      success: true,
      data: {
        data: visitors,
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ success: false, error: "Failed to fetch visitors" });
  }
});

// Get visitor by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const visitor = await prisma.visitor.findUnique({
      where: { id },
      include: {
        visits: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            host: true,
            site: true,
          },
        },
      },
    });

    if (!visitor) {
      return res.status(404).json({ success: false, error: "Visitor not found" });
    }

    res.json({ success: true, data: visitor });
  } catch (error) {
    console.error("Error fetching visitor:", error);
    res.status(500).json({ success: false, error: "Failed to fetch visitor" });
  }
});

// Look up visitor by phone number
router.get("/lookup/phone/:phone", async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const normalizedPhone = phone.replace(/\D/g, "");

    const visitor = await prisma.visitor.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { phone: phone },
          { phone: { contains: normalizedPhone } },
        ],
      },
    });

    if (!visitor) {
      return res.status(404).json({ success: false, error: "Visitor not found" });
    }

    res.json({ success: true, data: visitor });
  } catch (error) {
    console.error("Error looking up visitor:", error);
    res.status(500).json({ success: false, error: "Failed to look up visitor" });
  }
});

// Create new visitor
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = createVisitorSchema.parse(req.body);

    // Check for existing visitor with same email and name
    if (validatedData.email) {
      const existing = await prisma.visitor.findFirst({
        where: {
          email: validatedData.email,
          name: validatedData.name,
        },
      });

      if (existing) {
        return res.json({ success: true, data: existing, message: "Visitor already exists" });
      }
    }

    // Generate unique visitor code
    let visitorCode = generateVisitorCode();
    let codeExists = true;
    while (codeExists) {
      const existing = await prisma.visitor.findUnique({ where: { visitorCode } });
      if (!existing) codeExists = false;
      else visitorCode = generateVisitorCode();
    }

    const visitor = await prisma.visitor.create({
      data: {
        ...validatedData,
        visitorCode,
      },
    });

    createAuditLog({
      action: "visitor.created",
      entityType: "visitor",
      entityId: visitor.id,
      details: { name: visitor.name, email: visitor.email, company: visitor.company },
    });

    res.status(201).json({
      success: true,
      data: visitor,
      message: "Visitor created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error creating visitor:", error);
    res.status(500).json({ success: false, error: "Failed to create visitor" });
  }
});

// Update visitor
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateVisitorSchema.parse(req.body);

    const visitor = await prisma.visitor.update({
      where: { id },
      data: validatedData,
    });

    createAuditLog({
      action: "visitor.updated",
      entityType: "visitor",
      entityId: visitor.id,
      details: { name: visitor.name, changes: validatedData },
    });

    res.json({
      success: true,
      data: visitor,
      message: "Visitor updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error updating visitor:", error);
    res.status(500).json({ success: false, error: "Failed to update visitor" });
  }
});

// Delete visitor
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if visitor has active visits
    const activeVisits = await prisma.visit.count({
      where: {
        visitorId: id,
        status: { in: ["pending", "approved", "checked_in"] },
      },
    });

    if (activeVisits > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete visitor with active visits",
      });
    }

    const visitor = await prisma.visitor.findUnique({ where: { id } });
    await prisma.visitor.delete({ where: { id } });

    createAuditLog({
      action: "visitor.deleted",
      entityType: "visitor",
      entityId: id,
      details: { name: visitor?.name, email: visitor?.email },
    });

    res.json({ success: true, message: "Visitor deleted successfully" });
  } catch (error) {
    console.error("Error deleting visitor:", error);
    res.status(500).json({ success: false, error: "Failed to delete visitor" });
  }
});

export default router;
