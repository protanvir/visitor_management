import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";

const router = Router();

// Validation schemas
const createEmployeeSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name is required"),
  designation: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(["admin", "receptionist", "security", "employee"]).default("employee"),
  phone: z.string().optional(),
  siteId: z.string().uuid().optional(),
  organizationId: z.string().uuid("Organization ID is required"),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

// Get all employees with pagination and search
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      pageSize = "10",
      search,
      siteId,
      department,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const skip = (pageNum - 1) * size;

    // Build filter conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
        { department: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (siteId) where.siteId = siteId;
    if (department) where.department = department;

    // Get employees with pagination
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: size,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          site: true,
          _count: {
            select: { hostedVisits: true },
          },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        data: employees,
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ success: false, error: "Failed to fetch employees" });
  }
});

// Get employee by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        site: true,
        hostedVisits: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            visitor: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ success: false, error: "Failed to fetch employee" });
  }
});

// Create new employee
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = createEmployeeSchema.parse(req.body);

    // Check for existing employee with same email
    const existing = await prisma.employee.findUnique({
      where: { email: validatedData.email },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Employee with this email already exists",
      });
    }

    const employee = await prisma.employee.create({
      data: validatedData,
      include: {
        site: true,
      },
    });

    res.status(201).json({
      success: true,
      data: employee,
      message: "Employee created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error creating employee:", error);
    res.status(500).json({ success: false, error: "Failed to create employee" });
  }
});

// Update employee
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateEmployeeSchema.parse(req.body);

    // Check if email is being changed and already exists
    if (validatedData.email) {
      const existing = await prisma.employee.findFirst({
        where: {
          email: validatedData.email,
          id: { not: id },
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: "Employee with this email already exists",
        });
      }
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: validatedData,
      include: {
        site: true,
      },
    });

    res.json({
      success: true,
      data: employee,
      message: "Employee updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error updating employee:", error);
    res.status(500).json({ success: false, error: "Failed to update employee" });
  }
});

// Delete employee
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if employee has active visits
    const activeVisits = await prisma.visit.count({
      where: {
        hostId: id,
        status: { in: ["pending", "approved", "checked_in"] },
      },
    });

    if (activeVisits > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete employee with active visits",
      });
    }

    await prisma.employee.delete({ where: { id } });

    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ success: false, error: "Failed to delete employee" });
  }
});

// Get employee's current visitors
router.get("/:id/current-visitors", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const visits = await prisma.visit.findMany({
      where: {
        hostId: id,
        status: "checked_in",
      },
      include: {
        visitor: true,
        site: true,
        badge: true,
      },
      orderBy: { checkInTime: "desc" },
    });

    res.json({ success: true, data: visits });
  } catch (error) {
    console.error("Error fetching current visitors:", error);
    res.status(500).json({ success: false, error: "Failed to fetch current visitors" });
  }
});

// Get employee's pending approvals
router.get("/:id/pending-approvals", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const visits = await prisma.visit.findMany({
      where: {
        hostId: id,
        status: "pending",
      },
      include: {
        visitor: true,
        site: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: visits });
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ success: false, error: "Failed to fetch pending approvals" });
  }
});

// Check host availability
router.get("/:id/availability", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    // Get visits for the specified date (or today)
    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const visits = await prisma.visit.findMany({
      where: {
        hostId: id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ["pending", "approved", "checked_in"] },
      },
      select: {
        id: true,
        visitor: { select: { name: true } },
        purpose: true,
        expectedArrival: true,
        status: true,
      },
      orderBy: { expectedArrival: "asc" },
    });

    // Calculate availability
    const maxConcurrentVisits = 3; // Configurable limit
    const activeVisits = visits.filter((v) => v.status === "checked_in").length;
    const isAvailable = activeVisits < maxConcurrentVisits;

    // Suggest available time slots
    const bookedHours = visits
      .filter((v) => v.expectedArrival)
      .map((v) => new Date(v.expectedArrival!).getHours());

    const availableSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      if (!bookedHours.includes(hour)) {
        availableSlots.push(`${hour}:00`);
      }
    }

    res.json({
      success: true,
      data: {
        employee,
        date: targetDate.toISOString().split("T")[0],
        isAvailable,
        activeVisits,
        maxConcurrentVisits,
        scheduledVisits: visits,
        availableSlots,
      },
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ success: false, error: "Failed to check availability" });
  }
});

// Get employee's visitor history
router.get("/:id/history", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = "1", pageSize = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const skip = (pageNum - 1) * size;

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where: { hostId: id },
        include: {
          visitor: true,
          site: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: size,
      }),
      prisma.visit.count({
        where: { hostId: id },
      }),
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
    console.error("Error fetching visitor history:", error);
    res.status(500).json({ success: false, error: "Failed to fetch visitor history" });
  }
});

// Bulk approve visits
router.post("/bulk-approve", async (req: Request, res: Response) => {
  try {
    const { visitIds } = req.body;

    if (!Array.isArray(visitIds) || visitIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "visitIds array is required",
      });
    }

    const result = await prisma.visit.updateMany({
      where: {
        id: { in: visitIds },
        status: "pending",
      },
      data: {
        status: "approved",
      },
    });

    res.json({
      success: true,
      data: {
        updated: result.count,
      },
      message: `${result.count} visits approved successfully`,
    });
  } catch (error) {
    console.error("Error bulk approving visits:", error);
    res.status(500).json({ success: false, error: "Failed to bulk approve visits" });
  }
});

export default router;
