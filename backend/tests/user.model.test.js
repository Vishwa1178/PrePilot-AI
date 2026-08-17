const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

describe("User model", () => {
  test("comparePassword returns true for a matching password", async () => {
    const user = new User({ name: "Test User", email: "t@example.com", password: "irrelevant" });
    user.password = await bcrypt.hash("correct-password", 4);

    await expect(user.comparePassword("correct-password")).resolves.toBe(true);
  });

  test("comparePassword returns false for a non-matching password", async () => {
    const user = new User({ name: "Test User", email: "t@example.com", password: "irrelevant" });
    user.password = await bcrypt.hash("correct-password", 4);

    await expect(user.comparePassword("wrong-password")).resolves.toBe(false);
  });

  test("fails schema validation without a valid email", () => {
    const user = new User({ name: "Test User", email: "not-an-email", password: "123456" });
    const err = user.validateSync();
    expect(err.errors.email).toBeDefined();
  });

  test("fails schema validation with a short password", () => {
    const user = new User({ name: "Test User", email: "valid@example.com", password: "123" });
    const err = user.validateSync();
    expect(err.errors.password).toBeDefined();
  });

  test("passes schema validation with valid fields", () => {
    const user = new User({ name: "Test User", email: "valid@example.com", password: "123456" });
    const err = user.validateSync();
    expect(err).toBeUndefined();
  });

  afterAll(async () => {
    await mongoose.disconnect().catch(() => {});
  });
});
