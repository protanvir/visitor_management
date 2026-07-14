import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import {
  cspMiddleware,
  securityHeadersMiddleware,
  inputSanitizationMiddleware,
  sqlInjectionPrevention,
  requestLoggingMiddleware,
} from "./middleware/security";

// Import routes
import visitorRoutes from "./routes/visitors";
import visitRoutes from "./routes/visits";
import employeeRoutes from "./routes/employees";
import siteRoutes from "./routes/sites";
import reportRoutes from "./routes/reports";
import notificationRoutes from "./routes/notifications";
import areaRoutes from "./routes/areas";
import safetyRoutes from "./routes/safety";
import ndaRoutes from "./routes/nda";
import badgeRoutes from "./routes/badges";
import auditRoutes from "./routes/audit";
import authRoutes from "./routes/auth";
import smsRoutes from "./routes/sms";
import permissionRoutes from "./routes/permissions";
import userRoutes from "./routes/users";
import organizationRoutes from "./routes/organizations";
import { authenticateToken } from "./routes/auth";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.API_PORT || 3001;

// Initialize Prisma
export const prisma = new PrismaClient();

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false })); // We use our own CSP
app.use(cspMiddleware);
app.use(securityHeadersMiddleware);
app.use(inputSanitizationMiddleware);
app.use(sqlInjectionPrevention);
app.use(requestLoggingMiddleware);

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting - enhanced
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: {
    success: false,
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/safety", safetyRoutes);
app.use("/api/nda", ndaRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);

// Public routes - no authentication required
app.get("/api/employees/public", async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
      },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch employees" });
  }
});

app.get("/api/sites/public", async (req, res) => {
  try {
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        address: true,
      },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: sites });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch sites" });
  }
});

// Protected routes - require authentication
const protectedRoutes = [
  "/api/visitors",
  "/api/visits",
  "/api/employees",
  "/api/sites",
  "/api/reports",
  "/api/notifications",
  "/api/areas",
  "/api/safety",
  "/api/nda",
  "/api/badges",
  "/api/audit",
  "/api/sms",
  "/api/permissions",
  "/api/organizations",
];

protectedRoutes.forEach((route) => {
  app.use(route, authenticateToken);
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Visitor Management System API",
    version: "1.0.0",
    company: "Aptech Group",
    endpoints: {
      auth: "/api/auth",
      visitors: "/api/visitors",
      visits: "/api/visits",
      employees: "/api/employees",
      sites: "/api/sites",
      reports: "/api/reports",
      notifications: "/api/notifications",
      areas: "/api/areas",
      safety: "/api/safety",
      nda: "/api/nda",
      badges: "/api/badges",
      audit: "/api/audit",
      sms: "/api/sms",
      users: "/api/users",
      organizations: "/api/organizations",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Error]", err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           Aptech Group - Visitor Management System        ║
║                      API Server Started                   ║
╠═══════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                              ║
║  Environment: ${(process.env.NODE_ENV || "development").padEnd(42)}║
║  Health Check: http://localhost:${PORT}/health                 ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
