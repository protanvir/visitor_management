import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";

const router = Router();

// Validation schemas
const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// Get all organizations
router.get("/", async (req: Request, res: Response) => {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            sites: true,
            employees: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ success: false, error: "Failed to fetch organizations" });
  }
});

// Get organization by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        sites: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ success: false, error: "Organization not found" });
    }

    res.json({ success: true, data: organization });
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ success: false, error: "Failed to fetch organization" });
  }
});

// Create new organization
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = createOrganizationSchema.parse(req.body);

    const organization = await prisma.organization.create({
      data: validatedData,
    });

    res.status(201).json({
      success: true,
      data: organization,
      message: "Organization created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error creating organization:", error);
    res.status(500).json({ success: false, error: "Failed to create organization" });
  }
});

export default router;
