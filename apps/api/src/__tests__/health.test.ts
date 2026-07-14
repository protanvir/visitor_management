import request from "supertest";
import express from "express";

// Create a minimal test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API info endpoint
  app.get("/api", (req, res) => {
    res.json({
      message: "Visitor Management System API",
      version: "1.0.0",
      company: "Aptech Group",
    });
  });

  return app;
};

describe("Health Check", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
  });

  it("should return health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.timestamp).toBeDefined();
  });

  it("should return API info", async () => {
    const response = await request(app).get("/api");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Visitor Management System API");
    expect(response.body.company).toBe("Aptech Group");
  });
});
