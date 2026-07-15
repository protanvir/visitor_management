import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";

const router = Router();

// Badge return schema
const returnBadgeSchema = z.object({
  visitId: z.string().uuid("Invalid visit ID"),
  returnedBy: z.string().optional(), // Staff member who collected the badge
  notes: z.string().optional(),
});

// Get all badges with return status
router.get("/", async (req: Request, res: Response) => {
  try {
    const { siteId, status } = req.query;

    const where: any = {};

    if (siteId) {
      where.visit = { siteId };
    }

    if (status === "returned") {
      where.returnedAt = { not: null };
    } else if (status === "active") {
      where.returnedAt = null;
    }

    const badges = await prisma.badge.findMany({
      where,
      include: {
        visit: {
          include: {
            visitor: true,
            host: true,
            site: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const totalBadges = badges.length;
    const returnedBadges = badges.filter((b) => b.returnedAt).length;
    const activeBadges = totalBadges - returnedBadges;
    const overdueBadges = badges.filter(
      (b) => !b.returnedAt && new Date(b.expiresAt) < new Date()
    ).length;

    res.json({
      success: true,
      data: {
        badges,
        stats: {
          total: totalBadges,
          returned: returnedBadges,
          active: activeBadges,
          overdue: overdueBadges,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ success: false, error: "Failed to fetch badges" });
  }
});

// Lookup badge by QR code (used by kiosk for pre-registered visitors)
router.get("/lookup", async (req: Request, res: Response) => {
  try {
    const { qrCode } = req.query;

    if (!qrCode) {
      return res.status(400).json({ success: false, error: "qrCode query parameter is required" });
    }

    const badge = await prisma.badge.findFirst({
      where: { qrCode: qrCode as string },
      include: {
        visit: {
          include: {
            visitor: true,
            host: true,
            site: true,
          },
        },
      },
    });

    if (!badge) {
      return res.status(404).json({ success: false, error: "Badge not found" });
    }

    if (badge.expiresAt < new Date()) {
      return res.status(400).json({ success: false, error: "Badge has expired" });
    }

    if (badge.returnedAt) {
      return res.status(400).json({ success: false, error: "Badge has already been returned" });
    }

    res.json({ success: true, data: badge });
  } catch (error) {
    console.error("Error looking up badge:", error);
    res.status(500).json({ success: false, error: "Failed to lookup badge" });
  }
});

// Get badge by visit ID
router.get("/visit/:visitId", async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params;

    const badge = await prisma.badge.findUnique({
      where: { visitId },
      include: {
        visit: {
          include: {
            visitor: true,
            host: true,
            site: true,
          },
        },
      },
    });

    if (!badge) {
      return res.status(404).json({ success: false, error: "Badge not found" });
    }

    res.json({ success: true, data: badge });
  } catch (error) {
    console.error("Error fetching badge:", error);
    res.status(500).json({ success: false, error: "Failed to fetch badge" });
  }
});

// Return badge
router.post("/return", async (req: Request, res: Response) => {
  try {
    const validatedData = returnBadgeSchema.parse(req.body);

    const badge = await prisma.badge.findUnique({
      where: { visitId: validatedData.visitId },
      include: { visit: true },
    });

    if (!badge) {
      return res.status(404).json({ success: false, error: "Badge not found" });
    }

    if (badge.returnedAt) {
      return res.status(400).json({ success: false, error: "Badge already returned" });
    }

    // Update badge with return info
    const updatedBadge = await prisma.badge.update({
      where: { visitId: validatedData.visitId },
      data: {
        returnedAt: new Date(),
        returnedBy: validatedData.returnedBy,
        returnNotes: validatedData.notes,
      },
    });

    res.json({
      success: true,
      data: updatedBadge,
      message: "Badge returned successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error returning badge:", error);
    res.status(500).json({ success: false, error: "Failed to return badge" });
  }
});

// Get overdue badges
router.get("/overdue", async (req: Request, res: Response) => {
  try {
    const overdueBadges = await prisma.badge.findMany({
      where: {
        returnedAt: null,
        expiresAt: { lt: new Date() },
      },
      include: {
        visit: {
          include: {
            visitor: true,
            host: true,
            site: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: overdueBadges,
      count: overdueBadges.length,
    });
  } catch (error) {
    console.error("Error fetching overdue badges:", error);
    res.status(500).json({ success: false, error: "Failed to fetch overdue badges" });
  }
});

// Get badge return history
router.get("/history", async (req: Request, res: Response) => {
  try {
    const { page = "1", pageSize = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const skip = (pageNum - 1) * size;

    const [badges, total] = await Promise.all([
      prisma.badge.findMany({
        where: { returnedAt: { not: null } },
        include: {
          visit: {
            include: {
              visitor: true,
              host: true,
            },
          },
        },
        orderBy: { returnedAt: "desc" },
        skip,
        take: size,
      }),
      prisma.badge.count({
        where: { returnedAt: { not: null } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        data: badges,
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    console.error("Error fetching badge history:", error);
    res.status(500).json({ success: false, error: "Failed to fetch badge history" });
  }
});

export default router;
