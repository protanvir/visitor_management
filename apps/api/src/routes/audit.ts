import { Router, Request, Response } from "express";
import { prisma } from "../index";

const router = Router();

// Audit log types
type AuditAction = 
  | "visitor.created"
  | "visitor.updated"
  | "visitor.deleted"
  | "visit.created"
  | "visit.checked_in"
  | "visit.checked_out"
  | "visit.approved"
  | "visit.rejected"
  | "badge.created"
  | "badge.returned"
  | "nda.signed"
  | "safety.completed"
  | "area.access_granted"
  | "area.access_denied"
  | "emergency.alert_sent"
  | "notification.sent";

interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string;
  user_name?: string;
  details?: any;
  ipAddress?: string;
  createdAt: Date;
}

// In-memory audit log (in production, use database table)
const auditLogs: AuditLog[] = [];

// Helper to create audit log
export function createAuditLog(data: Omit<AuditLog, "id" | "createdAt">) {
  const log: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    createdAt: new Date(),
  };
  auditLogs.unshift(log); // Add to beginning (newest first)
  
  // Keep only last 10000 logs in memory
  if (auditLogs.length > 10000) {
    auditLogs.pop();
  }
  
  console.log(`[Audit] ${data.action} on ${data.entityType}:${data.entityId}`);
  return log;
}

// Get all audit logs
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      pageSize = "50",
      action,
      entityType,
      entityId,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const skip = (pageNum - 1) * size;

    let filteredLogs = [...auditLogs];

    // Apply filters
    if (action) {
      filteredLogs = filteredLogs.filter((log) => log.action === action);
    }
    if (entityType) {
      filteredLogs = filteredLogs.filter((log) => log.entityType === entityType);
    }
    if (entityId) {
      filteredLogs = filteredLogs.filter((log) => log.entityId === entityId);
    }
    if (startDate) {
      const start = new Date(startDate as string);
      filteredLogs = filteredLogs.filter((log) => log.createdAt >= start);
    }
    if (endDate) {
      const end = new Date(endDate as string);
      filteredLogs = filteredLogs.filter((log) => log.createdAt <= end);
    }

    // Paginate
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
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ success: false, error: "Failed to fetch audit logs" });
  }
});

// Get audit log by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const log = auditLogs.find((l) => l.id === id);

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

    let filteredLogs = [...auditLogs];

    if (startDate) {
      const start = new Date(startDate as string);
      filteredLogs = filteredLogs.filter((log) => log.createdAt >= start);
    }
    if (endDate) {
      const end = new Date(endDate as string);
      filteredLogs = filteredLogs.filter((log) => log.createdAt <= end);
    }

    // Group by action
    const actionCounts = filteredLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by entity type
    const entityCounts = filteredLogs.reduce((acc, log) => {
      acc[log.entityType] = (acc[log.entityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Activity by hour
    const activityByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: filteredLogs.filter((log) => log.createdAt.getHours() === i).length,
    }));

    res.json({
      success: true,
      data: {
        totalLogs: filteredLogs.length,
        actionCounts,
        entityCounts,
        activityByHour,
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
      { value: "badge.created", label: "Badge Created" },
      { value: "badge.returned", label: "Badge Returned" },
      { value: "nda.signed", label: "NDA Signed" },
      { value: "safety.completed", label: "Safety Briefing Completed" },
      { value: "area.access_granted", label: "Area Access Granted" },
      { value: "area.access_denied", label: "Area Access Denied" },
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

    let filteredLogs = [...auditLogs];

    if (startDate) {
      const start = new Date(startDate as string);
      filteredLogs = filteredLogs.filter((log) => log.createdAt >= start);
    }
    if (endDate) {
      const end = new Date(endDate as string);
      filteredLogs = filteredLogs.filter((log) => log.createdAt <= end);
    }

    const headers = ["ID", "Action", "Entity Type", "Entity ID", "User", "Details", "IP Address", "Timestamp"];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.action,
      log.entityType,
      log.entityId,
      log.user_name || log.userId || "-",
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
