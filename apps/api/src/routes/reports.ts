import { Router, Request, Response } from "express";
import { prisma } from "../index";

const router = Router();

// Get visitor statistics
router.get("/statistics", async (req: Request, res: Response) => {
  try {
    const { siteId, startDate, endDate } = req.query;

    const where: any = {};

    if (siteId) where.siteId = siteId as string;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Get overall statistics
    const [
      totalVisits,
      totalCheckedIn,
      totalCheckedOut,
      totalPending,
      visitsByType,
      visitsByDay,
      visitsByHour,
    ] = await Promise.all([
      prisma.visit.count({ where }),
      prisma.visit.count({ where: { ...where, status: "checked_in" } }),
      prisma.visit.count({ where: { ...where, status: "checked_out" } }),
      prisma.visit.count({ where: { ...where, status: "pending" } }),
      prisma.visit.groupBy({
        by: ["visitorType"],
        where,
        _count: true,
      }),
      // Get visits by day (last 30 days)
      prisma.visit.findMany({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          createdAt: true,
        },
      }),
      // Get visits by hour
      prisma.visit.findMany({
        where,
        select: {
          checkInTime: true,
        },
        where: {
          checkInTime: { not: null },
        },
      }),
    ]);

    // Process visits by day
    const visitsByDayMap: Record<string, number> = {};
    visitsByDay.forEach((visit) => {
      const day = visit.createdAt.toISOString().split("T")[0];
      visitsByDayMap[day] = (visitsByDayMap[day] || 0) + 1;
    });

    // Process visits by hour
    const visitsByHourMap: Record<number, number> = {};
    for (let i = 0; i < 24; i++) visitsByHourMap[i] = 0;
    visitsByHour.forEach((visit) => {
      if (visit.checkInTime) {
        const hour = visit.checkInTime.getHours();
        visitsByHourMap[hour] = (visitsByHourMap[hour] || 0) + 1;
      }
    });

    // Find peak hour
    const peakHour = Object.entries(visitsByHourMap).reduce((a, b) =>
      a[1] > b[1] ? a : b
    );

    // Calculate average duration
    const checkedOutVisits = await prisma.visit.findMany({
      where: {
        ...where,
        status: "checked_out",
        checkInTime: { not: null },
        checkOutTime: { not: null },
      },
      select: {
        checkInTime: true,
        checkOutTime: true,
      },
    });

    const totalDuration = checkedOutVisits.reduce((sum, visit) => {
      const duration = visit.checkOutTime!.getTime() - visit.checkInTime!.getTime();
      return sum + duration;
    }, 0);

    const averageDurationMs = checkedOutVisits.length > 0
      ? totalDuration / checkedOutVisits.length
      : 0;

    const averageDurationMinutes = Math.round(averageDurationMs / 60000);

    res.json({
      success: true,
      data: {
        totalVisits,
        currentVisitors: totalCheckedIn,
        checkedOut: totalCheckedOut,
        pending: totalPending,
        averageDuration: `${Math.floor(averageDurationMinutes / 60)}h ${averageDurationMinutes % 60}m`,
        averageDurationMinutes,
        peakHour: parseInt(peakHour[0]),
        visitsByType: visitsByType.reduce((acc, item) => {
          acc[item.visitorType] = item._count;
          return acc;
        }, {} as Record<string, number>),
        visitsByDay: visitsByDayMap,
        visitsByHour: visitsByHourMap,
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ success: false, error: "Failed to fetch statistics" });
  }
});

// Export visits as CSV
router.get("/export/csv", async (req: Request, res: Response) => {
  try {
    const { siteId, startDate, endDate } = req.query;

    const where: any = {};

    if (siteId) where.siteId = siteId as string;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const visits = await prisma.visit.findMany({
      where,
      include: {
        visitor: true,
        host: true,
        site: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert to CSV
    const headers = [
      "Visit ID",
      "Visitor Name",
      "Visitor Email",
      "Visitor Company",
      "Host Name",
      "Host Email",
      "Site",
      "Purpose",
      "Visitor Type",
      "Status",
      "Check In Time",
      "Check Out Time",
      "Duration (minutes)",
      "Created At",
    ];

    const rows = visits.map((visit) => {
      const duration =
        visit.checkInTime && visit.checkOutTime
          ? Math.round(
              (visit.checkOutTime.getTime() - visit.checkInTime.getTime()) / 60000
            )
          : "";

      return [
        visit.id,
        visit.visitor.name,
        visit.visitor.email || "",
        visit.visitor.company || "",
        visit.host.name,
        visit.host.email,
        visit.site.name,
        visit.purpose || "",
        visit.visitorType,
        visit.status,
        visit.checkInTime?.toISOString() || "",
        visit.checkOutTime?.toISOString() || "",
        duration.toString(),
        visit.createdAt.toISOString(),
      ];
    });

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="visits-export-${new Date().toISOString().split("T")[0]}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ success: false, error: "Failed to export CSV" });
  }
});

// Get dashboard data
router.get("/dashboard", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.query;

    const where: any = {};
    if (siteId) where.siteId = siteId as string;

    // Get today's statistics
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayWhere = {
      ...where,
      createdAt: { gte: todayStart },
    };

    const [
      todayVisits,
      currentVisitors,
      pendingApprovals,
      recentVisits,
      topHosts,
    ] = await Promise.all([
      prisma.visit.count({ where: todayWhere }),
      prisma.visit.count({ where: { ...where, status: "checked_in" } }),
      prisma.visit.count({ where: { ...where, status: "pending" } }),
      prisma.visit.findMany({
        where,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          visitor: true,
          host: true,
        },
      }),
      prisma.visit.groupBy({
        by: ["hostId"],
        where: todayWhere,
        _count: true,
        orderBy: { _count: { hostId: "desc" } },
        take: 5,
      }),
    ]);

    // Get host details for top hosts
    const topHostIds = topHosts.map((h) => h.hostId);
    const topHostDetails = await prisma.employee.findMany({
      where: { id: { in: topHostIds } },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const topHostsWithDetails = topHosts.map((h) => ({
      ...topHostDetails.find((d) => d.id === h.hostId),
      visitCount: h._count,
    }));

    res.json({
      success: true,
      data: {
        todayVisits,
        currentVisitors,
        pendingApprovals,
        recentVisits,
        topHosts: topHostsWithDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ success: false, error: "Failed to fetch dashboard data" });
  }
});

// Export visits as PDF (HTML format for printing)
router.get("/export/pdf", async (req: Request, res: Response) => {
  try {
    const { siteId, startDate, endDate } = req.query;

    const where: any = {};
    if (siteId) where.siteId = siteId as string;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const visits = await prisma.visit.findMany({
      where,
      include: {
        visitor: true,
        host: true,
        site: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Aptech Group - Visitor Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #102a43; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #102a43; }
    .subtitle { color: #666; margin-top: 5px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
    th { background-color: #102a43; color: white; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 10px; }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-neutral { background: #e2e8f0; color: #475569; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Aptech Group</div>
    <div class="subtitle">Visitor Management Report</div>
  </div>
  
  <div class="meta">
    <span>Generated: ${new Date().toLocaleString()}</span>
    <span>Total Visits: ${visits.length}</span>
    <span>Period: ${startDate || "All time"} to ${endDate || "Now"}</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Visitor</th>
        <th>Company</th>
        <th>Host</th>
        <th>Site</th>
        <th>Purpose</th>
        <th>Type</th>
        <th>Status</th>
        <th>Check In</th>
        <th>Check Out</th>
      </tr>
    </thead>
    <tbody>
      ${visits.map(v => `
      <tr>
        <td>${new Date(v.createdAt).toLocaleDateString()}</td>
        <td>${v.visitor.name}</td>
        <td>${v.visitor.company || "-"}</td>
        <td>${v.host.name}</td>
        <td>${v.site.name}</td>
        <td>${v.purpose || "-"}</td>
        <td>${v.visitorType}</td>
        <td><span class="badge badge-${v.status === 'checked_in' ? 'success' : v.status === 'pending' ? 'warning' : 'neutral'}">${v.status}</span></td>
        <td>${v.checkInTime ? new Date(v.checkInTime).toLocaleString() : "-"}</td>
        <td>${v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : "-"}</td>
      </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="footer">
    <p>Aptech Group - Visitor Management System</p>
    <p>This report was generated automatically</p>
  </div>
</body>
</html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="visitor-report-${new Date().toISOString().split("T")[0]}.html"`
    );
    res.send(html);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    res.status(500).json({ success: false, error: "Failed to export PDF" });
  }
});

// Get visitor history (all visits for a visitor)
router.get("/visitor-history/:visitorId", async (req: Request, res: Response) => {
  try {
    const { visitorId } = req.params;
    const { page = "1", pageSize = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const skip = (pageNum - 1) * size;

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where: { visitorId },
        include: {
          host: true,
          site: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: size,
      }),
      prisma.visit.count({
        where: { visitorId },
      }),
    ]);

    // Calculate statistics
    const totalDuration = visits
      .filter((v) => v.checkInTime && v.checkOutTime)
      .reduce((sum, v) => sum + (v.checkOutTime!.getTime() - v.checkInTime!.getTime()), 0);

    const avgDuration = visits.filter((v) => v.checkInTime && v.checkOutTime).length > 0
      ? totalDuration / visits.filter((v) => v.checkInTime && v.checkOutTime).length / 60000
      : 0;

    res.json({
      success: true,
      data: {
        data: visits,
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size),
        stats: {
          totalVisits: total,
          averageDurationMinutes: Math.round(avgDuration),
          sitesVisited: [...new Set(visits.map((v) => v.site.name))],
          hostsMet: [...new Set(visits.map((v) => v.host.name))],
        },
      },
    });
  } catch (error) {
    console.error("Error fetching visitor history:", error);
    res.status(500).json({ success: false, error: "Failed to fetch visitor history" });
  }
});

export default router;
