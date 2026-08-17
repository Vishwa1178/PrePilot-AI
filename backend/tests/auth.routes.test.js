const request = require("supertest");

// Mock the User model so these tests exercise routing, validation, and
// controller logic without needing a real MongoDB connection.
jest.mock("../models/User");
const User = require("../models/User");

const app = require("../server");

describe("Auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    test("rejects a request missing required fields", async () => {
      const res = await request(app).post("/api/auth/register").send({ email: "a@b.com" });
      expect(res.status).toBe(400);
    });

    test("rejects an invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Jane Doe", email: "not-an-email", password: "password1" });
      expect(res.status).toBe(400);
    });

    test("rejects a short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Jane Doe", email: "jane@example.com", password: "123" });
      expect(res.status).toBe(400);
    });

    test("creates a new user and returns a token", async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        name: "Jane Doe",
        email: "jane@example.com",
        targetRole: "",
        avatarInitials: "JD",
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Jane Doe", email: "jane@example.com", password: "password1" });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe("jane@example.com");
    });

    test("rejects registration for an already-existing email", async () => {
      User.findOne.mockResolvedValue({ _id: "existing", email: "jane@example.com" });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Jane Doe", email: "jane@example.com", password: "password1" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  describe("POST /api/auth/login", () => {
    test("rejects missing credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      expect(res.status).toBe(400);
    });

    test("rejects an unknown user with a generic message (no user enumeration)", async () => {
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "password1" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    test("rejects a wrong password", async () => {
      const mockUser = {
        _id: "1",
        email: "jane@example.com",
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "jane@example.com", password: "wrongpass" });

      expect(res.status).toBe(401);
    });

    test("logs in successfully with correct credentials", async () => {
      const mockUser = {
        _id: "1",
        name: "Jane Doe",
        email: "jane@example.com",
        targetRole: "",
        avatarInitials: "JD",
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "jane@example.com", password: "password1" });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });

  describe("GET /api/auth/me", () => {
    test("rejects requests with no token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });
});
