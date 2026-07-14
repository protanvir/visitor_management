import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";

const router = Router();

// Permission types
type Permission =
  | "visitors.view"
  | "visitors.create"
  | "visitors.edit"
  | "visitors.delete"
  | "visits.view"
  | "visits.create"
  | "visits.approve"
  | "visits.reject"
  | "visits.checkin"
  | "visits.checkout"
  | "employees.view"
  | "employees.create"
  | "employees.edit"
  | "employees.delete"
  | "sites.view"
  | "sites.create"
  | "sites.edit"
  | "sites.delete"
  | "reports.view"
  | "reports.export"
  | "settings.view"
  | "settings.edit"
  | "audit.view"
  | "emergency.manage";

// Default role permissions
const rolePermissions: Record<string, Permission[]> = {
  admin: [
    "visitors.view", "visitors.create", "visitors.edit", "visitors.delete",
    "visits.view", "visits.create", "visits.approve", "visits.reject", "visits.checkin", "visits.checkout",
    "employees.view", "employees.create", "employees.edit", "employees.delete",
    "sites.view", "sites.create", "sites.edit", "sites.delete",
    "reports.view", "reports.export",
    "settings.view", "settings.edit",
    "audit.view",
    "emergency.manage",
  ],
  manager: [
    "visitors.view", "visitors.create", "visitors.edit",
    "visits.view", "visits.create", "visits.approve", "visits.reject", "visits.checkin", "visits.checkout",
    "employees.view", "employees.create", "employees.edit",
    "sites.view",
    "reports.view", "reports.export",
    "settings.view",
    "emergency.manage",
  ],
  user: [
    "visitors.view",
    "visits.view", "visits.create", "visits.checkin", "visits.checkout",
    "employees.view",
    "sites.view",
    "reports.view",
  ],
};

// Get role permissions
router.get("/roles/:role/permissions", async (req: Request, res: Response) => {
  try {
    const { role } = req.params;

    const permissions = rolePermissions[role] || [];

    res.json({
      success: true,
      data: {
        role,
        permissions,
      },
    });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch permissions" });
  }
});

// Get all available permissions
router.get("/permissions", async (req: Request, res: Response) => {
  try {
    const allPermissions = Object.values(rolePermissions).flat();
    const uniquePermissions = [...new Set(allPermissions)].sort();

    // Group by category
    const grouped: Record<string, string[]> = {};
    uniquePermissions.forEach((perm) => {
      const [category] = perm.split(".");
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(perm);
    });

    res.json({
      success: true,
      data: {
        permissions: uniquePermissions,
        grouped,
      },
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch permissions" });
  }
});

// Check if user has permission
router.post("/check", async (req: Request, res: Response) => {
  try {
    const { role, permission } = req.body;

    if (!role || !permission) {
      return res.status(400).json({
        success: false,
        error: "Role and permission are required",
      });
    }

    const permissions = rolePermissions[role] || [];
    const hasPermission = permissions.includes(permission as Permission);

    res.json({
      success: true,
      data: {
        role,
        permission,
        hasPermission,
      },
    });
  } catch (error) {
    console.error("Error checking permission:", error);
    res.status(500).json({ success: false, error: "Failed to check permission" });
  }
});

// Get site-specific permissions
router.get("/site/:siteId", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;

    // In production, this would query a site_permissions table
    // For now, return default permissions based on site settings
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    // Default site permissions
    const sitePermissions = {
      siteId,
      siteName: site.name,
      settings: {
        requireNDA: (site.settings as any)?.requireNDA || false,
        requireSafetyBriefing: (site.settings as any)?.safetyChecklist || false,
        maxConcurrentVisitors: (site.settings as any)?.maxOccupancy || 100,
        allowWalkIns: true,
        requireHostApproval: true,
      },
      accessLevels: {
        public: {
          requiresNDA: false,
          requiresSafetyBriefing: false,
          requiresApproval: false,
        },
        restricted: {
          requiresNDA: true,
          requiresSafetyBriefing: false,
          requiresApproval: true,
        },
        secure: {
          requiresNDA: true,
          requiresSafetyBriefing: true,
          requiresApproval: true,
        },
      },
    };

    res.json({ success: true, data: sitePermissions });
  } catch (error) {
    console.error("Error fetching site permissions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch site permissions" });
  }
});

// Update site permissions
router.put("/site/:siteId", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { settings } = req.body;

    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return res.status(404).json({ success: false, error: "Site not found" });
    }

    // Merge settings
    const updatedSettings = {
      ...(site.settings as any),
      ...settings,
    };

    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: { settings: updatedSettings },
    });

    res.json({
      success: true,
      data: updatedSite,
      message: "Site permissions updated successfully",
    });
  } catch (error) {
    console.error("Error updating site permissions:", error);
    res.status(500).json({ success: false, error: "Failed to update site permissions" });
  }
});

// Bulk permission check
router.post("/bulk-check", async (req: Request, res: Response) => {
  try {
    const { role, permissions } = req.body;

    if (!role || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: "Role and permissions array are required",
      });
    }

    const rolePerms = rolePermissions[role] || [];
    const results = permissions.map((perm: string) => ({
      permission: perm,
      hasPermission: rolePerms.includes(perm as Permission),
    }));

    res.json({
      success: true,
      data: {
        role,
        results,
      },
    });
  } catch (error) {
    console.error("Error checking bulk permissions:", error);
    res.status(500).json({ success: false, error: "Failed to check permissions" });
  }
});

export default router;
