import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";
import QRCode from "qrcode";
import { notificationService } from "../services/notification";

const router = Router();

// Validation schemas
const createVisitSchema = z.object({
  visitorId: z.string().uuid("Invalid visitor ID"),
  hostId: z.string().uuid("Invalid host ID"),
  siteId: z.string().uuid("Invalid site ID"),
  purpose: z.string().optional(),
  visitorType: z.enum(["guest", "contractor", "vendor", "delivery", "interview"]).default("guest"),
  expectedArrival: z.string().datetime().optional(),
  expectedDeparture: z.string().datetime().optional(),
});

const checkInSchema = z.object({
  qrCode: z.string().optional(),
  visitorId: z.string().uuid().optional(),
  hostId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  purpose: z.string().optional(),
  visitorType: z.enum(["guest", "contractor", "vendor", "delivery", "interview"]).optional(),
});

// Get all visits with pagination and filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      pageSize = "10",
      status,
      visitorType,
      siteId,
      hostId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const skip = (pageNum - 1) * size;

    // Build filter conditions
    const where: any = {};

    if (status) where.status = status;
    if (visitorType) where.visitorType = visitorType;
    if (siteId) where.siteId = siteId;
    if (hostId) where.hostId = hostId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Get visits with pagination
    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        skip,
        take: size,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          visitor: true,
          host: true,
          site: true,
          badge: true,
        },
      }),
      prisma.visit.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        data: visits,
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({ success: false, error: "Failed to fetch visits" });
  }
});

// Get visit by ID, Visitor ID, or Visitor Code (V-XXX)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const include = {
      visitor: true,
      host: true,
      site: true,
      badge: true,
      notifications: true,
    };

    // 1. Try by visit ID
    let visit = await prisma.visit.findUnique({ where: { id }, include });

    // 2. Try by visitor ID (most recent visit for that visitor)
    if (!visit) {
      visit = await prisma.visit.findFirst({
        where: { visitorId: id },
        orderBy: { createdAt: "desc" },
        include,
      });
    }

    // 3. Try by visitorCode (e.g. V-ABC123)
    if (!visit) {
      const visitor = await prisma.visitor.findUnique({ where: { visitorCode: id } });
      if (visitor) {
        visit = await prisma.visit.findFirst({
          where: { visitorId: visitor.id },
          orderBy: { createdAt: "desc" },
          include,
        });
      }
    }

    if (!visit) {
      return res.status(404).json({ success: false, error: "Visit not found" });
    }

    res.json({ success: true, data: visit });
  } catch (error) {
    console.error("Error fetching visit:", error);
    res.status(500).json({ success: false, error: "Failed to fetch visit" });
  }
});

// Create new visit (pre-registration)
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = createVisitSchema.parse(req.body);

    // Verify visitor, host, and site exist
    const [visitor, host, site] = await Promise.all([
      prisma.visitor.findUnique({ where: { id: validatedData.visitorId } }),
      prisma.employee.findUnique({ where: { id: validatedData.hostId } }),
      prisma.site.findUnique({ where: { id: validatedData.siteId } }),
    ]);

    if (!visitor) return res.status(400).json({ success: false, error: "Visitor not found" });
    if (!host) return res.status(400).json({ success: false, error: "Host not found" });
    if (!site) return res.status(400).json({ success: false, error: "Site not found" });

    const visit = await prisma.visit.create({
      data: {
        ...validatedData,
        status: "pending",
      },
      include: {
        visitor: true,
        host: true,
        site: true,
      },
    });

    res.status(201).json({
      success: true,
      data: visit,
      message: "Visit created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error creating visit:", error);
    res.status(500).json({ success: false, error: "Failed to create visit" });
  }
});

// Check in visitor
router.post("/checkin", async (req: Request, res: Response) => {
  try {
    const validatedData = checkInSchema.parse(req.body);

    let visit;

    // If QR code provided, find visit by QR code
    if (validatedData.qrCode) {
      const badge = await prisma.badge.findUnique({
        where: { qrCode: validatedData.qrCode },
        include: { visit: true },
      });

      if (!badge) {
        return res.status(400).json({ success: false, error: "Invalid QR code" });
      }

      if (badge.expiresAt < new Date()) {
        return res.status(400).json({ success: false, error: "Badge has expired" });
      }

      visit = badge.visit;
    } else {
      // Create walk-in visit
      if (!validatedData.visitorId || !validatedData.hostId || !validatedData.siteId) {
        return res.status(400).json({
          success: false,
          error: "visitorId, hostId, and siteId are required for walk-in registration",
        });
      }

      // Check watchlist
      const watchlistMatch = await prisma.watchlist.findFirst({
        where: {
          active: true,
          OR: [
            { email: { not: null } },
            { name: { not: null } },
          ],
        },
        include: { organization: true },
      });

      // Verify visitor exists or create
      let visitor = await prisma.visitor.findUnique({
        where: { id: validatedData.visitorId },
      });

      if (!visitor) {
        return res.status(400).json({ success: false, error: "Visitor not found" });
      }

      // Check if visitor is on watchlist
      if (watchlistMatch) {
        const isBlocked = 
          (watchlistMatch.email && visitor.email === watchlistMatch.email) ||
          (watchlistMatch.name && visitor.name === watchlistMatch.name);

        if (isBlocked) {
          return res.status(403).json({
            success: false,
            error: "Visitor is on the watchlist and cannot be checked in",
          });
        }
      }

      // Create visit
      visit = await prisma.visit.create({
        data: {
          visitorId: validatedData.visitorId,
          hostId: validatedData.hostId,
          siteId: validatedData.siteId,
          purpose: validatedData.purpose,
          visitorType: validatedData.visitorType || "guest",
          status: "checked_in",
          checkInTime: new Date(),
        },
      });
    }

    // Update visit status to checked_in
    visit = await prisma.visit.update({
      where: { id: visit.id },
      data: {
        status: "checked_in",
        checkInTime: new Date(),
      },
      include: {
        visitor: true,
        host: true,
        site: true,
      },
    });

    // Generate QR code for badge
    const qrCodeData = await QRCode.toDataURL(visit.id, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    // Create badge with 8-hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);

    const badge = await prisma.badge.create({
      data: {
        visitId: visit.id,
        qrCode: qrCodeData,
        expiresAt,
      },
    });

    // Send notification to host
    notificationService.notifyHostArrival(visit.id).catch((err) => {
      console.error("Failed to send host notification:", err);
    });

    // Send SMS to host
    if (visit.host.phone) {
      const smsMessage = `Visitor Alert: ${visit.visitor.name} has arrived to see you at ${visit.site.name}. Purpose: ${visit.purpose || "Not specified"}. Please meet them at reception.`;
      import("../services/sms").then(({ sendSms }) => {
        sendSms({ to: visit.host.phone!, message: smsMessage }).catch((err) => {
          console.error("Failed to send SMS to host:", err);
        });
      }).catch((err) => {
        console.error("Failed to load SMS service:", err);
      });
    }

    res.json({
      success: true,
      data: {
        ...visit,
        badge,
      },
      message: "Visitor checked in successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error checking in visitor:", error);
    res.status(500).json({ success: false, error: "Failed to check in visitor" });
  }
});

// Check out visitor
router.post("/:id/checkout", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const visit = await prisma.visit.findUnique({
      where: { id },
      include: { badge: true },
    });

    if (!visit) {
      return res.status(404).json({ success: false, error: "Visit not found" });
    }

    if (visit.status !== "checked_in") {
      return res.status(400).json({
        success: false,
        error: `Cannot check out visitor with status: ${visit.status}`,
      });
    }

    const checkOutTime = new Date();
    const duration = visit.checkInTime
      ? Math.floor((checkOutTime.getTime() - visit.checkInTime.getTime()) / 60000)
      : 0;

    // Update visit
    const updatedVisit = await prisma.visit.update({
      where: { id },
      data: {
        status: "checked_out",
        checkOutTime,
      },
      include: {
        visitor: true,
        host: true,
        site: true,
      },
    });

    res.json({
      success: true,
      data: {
        ...updatedVisit,
        durationMinutes: duration,
        durationFormatted: `${Math.floor(duration / 60)}h ${duration % 60}m`,
      },
      message: "Visitor checked out successfully",
    });
  } catch (error) {
    console.error("Error checking out visitor:", error);
    res.status(500).json({ success: false, error: "Failed to check out visitor" });
  }
});

// Approve visit
router.post("/:id/approve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const visit = await prisma.visit.findUnique({ where: { id } });

    if (!visit) {
      return res.status(404).json({ success: false, error: "Visit not found" });
    }

    if (visit.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: `Cannot approve visit with status: ${visit.status}`,
      });
    }

    const updatedVisit = await prisma.visit.update({
      where: { id },
      data: { status: "approved" },
      include: {
        visitor: true,
        host: true,
        site: true,
      },
    });

    // Send approval notification to visitor
    notificationService.notifyVisitApproval(id).catch((err) => {
      console.error("Failed to send approval notification:", err);
    });

    res.json({
      success: true,
      data: updatedVisit,
      message: "Visit approved successfully",
    });
  } catch (error) {
    console.error("Error approving visit:", error);
    res.status(500).json({ success: false, error: "Failed to approve visit" });
  }
});

// Reject visit
router.post("/:id/reject", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const visit = await prisma.visit.findUnique({ where: { id } });

    if (!visit) {
      return res.status(404).json({ success: false, error: "Visit not found" });
    }

    if (visit.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: `Cannot reject visit with status: ${visit.status}`,
      });
    }

    const updatedVisit = await prisma.visit.update({
      where: { id },
      data: { status: "cancelled" },
      include: {
        visitor: true,
        host: true,
        site: true,
      },
    });

    // Send rejection notification to visitor
    notificationService.notifyVisitRejection(id, reason).catch((err) => {
      console.error("Failed to send rejection notification:", err);
    });

    res.json({
      success: true,
      data: updatedVisit,
      message: "Visit rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting visit:", error);
    res.status(500).json({ success: false, error: "Failed to reject visit" });
  }
});

// Get current visitors (checked in)
router.get("/current/active", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.query;

    const where: any = {
      status: "checked_in",
    };

    if (siteId) where.siteId = siteId;

    const visits = await prisma.visit.findMany({
      where,
      include: {
        visitor: true,
        host: true,
        site: true,
        badge: true,
      },
      orderBy: { checkInTime: "desc" },
    });

    res.json({ success: true, data: visits });
  } catch (error) {
    console.error("Error fetching active visitors:", error);
    res.status(500).json({ success: false, error: "Failed to fetch active visitors" });
  }
});

// Get evacuation list
router.get("/evacuation/list", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.query;

    const where: any = {
      status: "checked_in",
    };

    if (siteId) where.siteId = siteId;

    const visits = await prisma.visit.findMany({
      where,
      select: {
        id: true,
        visitor: {
          select: {
            name: true,
            company: true,
          },
        },
        host: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        site: {
          select: {
            name: true,
          },
        },
        checkInTime: true,
      },
      orderBy: { checkInTime: "asc" },
    });

    res.json({
      success: true,
      data: {
        totalVisitors: visits.length,
        visitors: visits,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching evacuation list:", error);
    res.status(500).json({ success: false, error: "Failed to fetch evacuation list" });
  }
});

// Automatic check-out for expired visits
router.post("/auto-checkout", async (req: Request, res: Response) => {
  try {
    const { maxDurationHours = 8 } = req.body;

    // Find visits that have exceeded max duration
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - maxDurationHours);

    const expiredVisits = await prisma.visit.findMany({
      where: {
        status: "checked_in",
        checkInTime: { lt: cutoffTime },
      },
      include: {
        visitor: true,
        host: true,
      },
    });

    // Auto checkout each expired visit
    const results = [];
    for (const visit of expiredVisits) {
      const checkOutTime = new Date();
      const duration = visit.checkInTime
        ? Math.floor((checkOutTime.getTime() - visit.checkInTime.getTime()) / 60000)
        : 0;

      await prisma.visit.update({
        where: { id: visit.id },
        data: {
          status: "checked_out",
          checkOutTime,
        },
      });

      results.push({
        visitId: visit.id,
        visitorName: visit.visitor.name,
        hostName: visit.host.name,
        checkInTime: visit.checkInTime,
        checkOutTime,
        durationMinutes: duration,
      });
    }

    res.json({
      success: true,
      data: {
        autoCheckedOut: results.length,
        visits: results,
      },
      message: `${results.length} visits auto-checked out`,
    });
  } catch (error) {
    console.error("Error auto-checking out visits:", error);
    res.status(500).json({ success: false, error: "Failed to auto-checkout visits" });
  }
});

// Request visit extension
router.post("/:id/extend", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { additionalHours = 2, reason } = req.body;

    const visit = await prisma.visit.findUnique({
      where: { id },
      include: { badge: true },
    });

    if (!visit) {
      return res.status(404).json({ success: false, error: "Visit not found" });
    }

    if (visit.status !== "checked_in") {
      return res.status(400).json({
        success: false,
        error: "Can only extend active visits",
      });
    }

    // Extend badge expiration if exists
    if (visit.badge) {
      const newExpiry = new Date(visit.badge.expiresAt);
      newExpiry.setHours(newExpiry.getHours() + additionalHours);

      await prisma.badge.update({
        where: { id: visit.badge.id },
        data: { expiresAt: newExpiry },
      });
    }

    res.json({
      success: true,
      data: {
        visitId: id,
        extendedBy: additionalHours,
        reason,
        newExpiry: visit.badge
          ? new Date(new Date(visit.badge.expiresAt).getTime() + additionalHours * 60 * 60 * 1000)
          : null,
      },
      message: `Visit extended by ${additionalHours} hours`,
    });
  } catch (error) {
    console.error("Error extending visit:", error);
    res.status(500).json({ success: false, error: "Failed to extend visit" });
  }
});

// Get visit statistics by time period
router.get("/stats/time", async (req: Request, res: Response) => {
  try {
    const { siteId, period = "day" } = req.query;

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // day
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const where: any = {
      createdAt: { gte: startDate },
    };

    if (siteId) where.siteId = siteId;

    const visits = await prisma.visit.findMany({
      where,
      select: {
        checkInTime: true,
        checkOutTime: true,
        visitorType: true,
        status: true,
      },
    });

    // Calculate peak hours
    const hourCounts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourCounts[i] = 0;

    visits.forEach((visit) => {
      if (visit.checkInTime) {
        const hour = visit.checkInTime.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    // Find peak hour
    const peakHour = Object.entries(hourCounts).reduce((a, b) =>
      parseInt(b[1] as any) > parseInt(a[1] as any) ? b : a
    );

    // Calculate average duration
    const durations = visits
      .filter((v) => v.checkInTime && v.checkOutTime)
      .map((v) => (v.checkOutTime!.getTime() - v.checkInTime!.getTime()) / 60000);

    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    // Visitor type breakdown
    const typeBreakdown = visits.reduce((acc, v) => {
      acc[v.visitorType] = (acc[v.visitorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalVisits: visits.length,
        period,
        startDate: startDate.toISOString(),
        peakHour: parseInt(peakHour[0]),
        peakHourCount: peakHour[1],
        averageDurationMinutes: Math.round(avgDuration),
        hourlyDistribution: hourCounts,
        typeBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching time stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch time stats" });
  }
});

export default router;
