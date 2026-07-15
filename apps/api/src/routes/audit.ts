import { Router, Request, Response } from "express";
import { prisma } from "../index";

const router = Router();

// Helper to create audit log (exported for use in other routes)
export async function createAuditLog(data: {
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  userName?: string;
  details?: any;
  ipAddress?: string;
}) {
  try {
    const log = await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId || null,
        userName: data.userName || null,
        details: data.details || null,
        ipAddress: data.ipAddress || null,
      },
    });

    console.log(`[Audit] ${data.action} on ${data.entityType}:${data.entityId}`);
    return log;
  } catch (error) {
    console.error("[Audit] Failed to create audit log:", error);
    return null;
  }
}

// Get all audit logs with pagination and filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      pageSize = "20",
      action,
      entityType,
      entityId,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const skip = (pageNum - 1) * size;

    // Build filter
    const where: any = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: size,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        data: logs,
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ success: false, error: "Failed to fetch audit logs" });
  }
});

// Get audit log by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const log = await prisma.auditLog.findUnique({ where: { id } });

    if (!log) {
      return res.status(404).json({ success: false, error: "Audit log not found" });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    res.status(500).json({ success: false, error: "Failed to fetch audit log" });
  }
});

// Get audit statistics
router.get("/stats/summary", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const totalLogs = await prisma.auditLog.count({ where });

    // Get action counts
    const actionGroups = await prisma.auditLog.groupBy({
      by: ["action"],
      where,
      _count: { action: true },
    });
    const actionCounts: Record<string, number> = {};
    actionGroups.forEach((g) => { actionCounts[g.action] = g._count.action; });

    // Get entity type counts
    const entityGroups = await prisma.auditLog.groupBy({
      by: ["entityType"],
      where,
      _count: { entityType: true },
    });
    const entityCounts: Record<string, number> = {};
    entityGroups.forEach((g) => { entityCounts[g.entityType] = g._count.entityType; });

    res.json({
      success: true,
      data: {
        totalLogs,
        actionCounts,
        entityCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch audit stats" });
  }
});

// Get available audit actions
router.get("/meta/actions", async (req: Request, res: Response) => {
  try {
    const actions = [
      { value: "visitor.created", label: "Visitor Created" },
      { value: "visitor.updated", label: "Visitor Updated" },
      { value: "visitor.deleted", label: "Visitor Deleted" },
      { value: "visit.created", label: "Visit Created" },
      { value: "visit.checked_in", label: "Check-In" },
      { value: "visit.checked_out", label: "Check-Out" },
      { value: "visit.approved", label: "Visit Approved" },
      { value: "visit.rejected", label: "Visit Rejected" },
      { value: "badge.generated", label: "Badge Generated" },
      { value: "badge.emailed", label: "Badge Emailed" },
      { value: "badge.returned", label: "Badge Returned" },
      { value: "nda.signed", label: "NDA Signed" },
      { value: "safety.completed", label: "Safety Briefing Completed" },
      { value: "emergency.alert_sent", label: "Emergency Alert Sent" },
      { value: "notification.sent", label: "Notification Sent" },
    ];

    res.json({ success: true, data: actions });
  } catch (error) {
    console.error("Error fetching audit actions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch audit actions" });
  }
});

// Export audit logs as CSV
router.get("/export/csv", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const headers = ["ID", "Action", "Entity Type", "Entity ID", "User", "Details", "IP Address", "Timestamp"];
    const rows = logs.map((log) => [
      log.id,
      log.action,
      log.entityType,
      log.entityId,
      log.userName || log.userId || "-",
      JSON.stringify(log.details || {}),
      log.ipAddress || "-",
      log.createdAt.toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    res.status(500).json({ success: false, error: "Failed to export audit logs" });
  }
});

export default router;
