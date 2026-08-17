const request = require("supertest");

jest.mock("../models/User");
jest.mock("../models/Interview");

const User = require("../models/User");
const Interview = require("../models/Interview");
const generateToken = require("../utils/generateToken");
const app = require("../server");

const FAKE_USER_ID = "507f1f77bcf86cd799439011";

describe("Interview routes", () => {
  let authHeader;

  beforeEach(() => {
    jest.clearAllMocks();
    authHeader = `Bearer ${generateToken(FAKE_USER_ID)}`;
    // The `protect` middleware calls User.findById(...).select("-password")
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: FAKE_USER_ID, name: "Jane Doe" }),
    });
  });

  test("rejects unauthenticated requests", async () => {
    const res = await request(app).post("/api/interviews/start").send({ mode: "HR", difficulty: "Easy" });
    expect(res.status).toBe(401);
  });

  test("rejects an invalid mode", async () => {
    const res = await request(app)
      .post("/api/interviews/start")
      .set("Authorization", authHeader)
      .send({ mode: "NotARealMode", difficulty: "Easy" });
    expect(res.status).toBe(400);
  });

  test("starts an interview and generates fallback questions", async () => {
    Interview.create.mockResolvedValue({
      _id: "abc123",
      user: FAKE_USER_ID,
      mode: "HR",
      difficulty: "Easy",
      company: "General",
      questions: [{ questionText: "Tell me about yourself." }],
    });

    const res = await request(app)
      .post("/api/interviews/start")
      .set("Authorization", authHeader)
      .send({ mode: "HR", difficulty: "Easy" });

    expect(res.status).toBe(201);
    expect(Interview.create).toHaveBeenCalledTimes(1);
    expect(res.body.interview.mode).toBe("HR");
  });

  test("returns 404 when the interview session doesn't belong to the user", async () => {
    Interview.findOne.mockResolvedValue(null);

    const res = await request(app).get("/api/interviews/does-not-exist").set("Authorization", authHeader);

    expect(res.status).toBe(404);
  });

  test("computes overall score on completion", async () => {
    const mockInterview = {
      questions: [{ score: 8 }, { score: 6 }, { score: null }],
      save: jest.fn().mockResolvedValue(true),
    };
    Interview.findOne.mockResolvedValue(mockInterview);

    const res = await request(app)
      .post("/api/interviews/abc123/complete")
      .set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(mockInterview.overallScore).toBe(7); // average of 8 and 6
    expect(mockInterview.status).toBe("completed");
  });
});
