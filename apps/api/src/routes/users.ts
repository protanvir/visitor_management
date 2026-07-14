import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authenticateToken, requireRole } from "./auth";

const router = Router();

// All routes require admin role
router.use(authenticateToken);
router.use(requireRole(["admin"]));

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "manager", "user"]).default("user"),
  organizationId: z.string().uuid("Invalid organization ID"),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "manager", "user"]).optional(),
  password: z.string().min(6).optional(),
});

// GET /api/users - List all users
router.get("/", async (req: Request, res: Response) => {
  try {
    const { search, role, page = "1", pageSize = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { email: { contains: String(search), mode: "insensitive" } },
      ];
    }
    if (role) {
      where.role = String(role);
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastLogin: true,
          createdAt: true,
          organization: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(pageSize),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        data: users,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// GET /api/users/:id - Get user by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        organization: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
});

// POST /api/users - Create user
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User with this email already exists" });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: validatedData.organizationId },
    });
    if (!organization) {
      return res.status(400).json({ success: false, error: "Organization not found" });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        role: validatedData.role,
        organizationId: validatedData.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, data: user, message: "User created successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation error", details: error.errors });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, error: "Failed to create user" });
  }
});

// PUT /api/users/:id - Update user
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check email uniqueness if changing email
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: validatedData.email } });
      if (emailTaken) {
        return res.status(400).json({ success: false, error: "Email already in use" });
      }
    }

    const updateData: any = { ...validatedData };
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: user, message: "User updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation error", details: error.errors });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, error: "Failed to update user" });
  }
});

// DELETE /api/users/:id - Delete user
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;

    if (currentUser.userId === req.params.id) {
      return res.status(400).json({ success: false, error: "Cannot delete your own account" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await prisma.user.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});

// POST /api/users/:id/reset-password - Admin reset password
router.post("/:id/reset-password", async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.params.id }, data: { password: hashedPassword } });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, error: "Failed to reset password" });
  }
});

export default router;
