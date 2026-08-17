import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../context/AuthContext";

vi.mock("../api/authService", () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  getMeApi: vi.fn(),
}));

import { loginApi, getMeApi } from "../api/authService";

// Small harness component so we can exercise the hook through the DOM
const Harness = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="authed">{String(isAuthenticated)}</span>
      <span data-testid="username">{user?.name || "none"}</span>
      <button onClick={() => login("jane@example.com", "password1")}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    getMeApi.mockRejectedValue(new Error("no token")); // default: no session to restore
  });

  test("starts unauthenticated with no stored token", async () => {
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("authed").textContent).toBe("false");
  });

  test("login stores the token/user and flips isAuthenticated to true", async () => {
    loginApi.mockResolvedValue({
      data: { token: "fake-jwt", user: { id: "1", name: "Jane Doe" } },
    });

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    await act(async () => {
      await userEvent.click(screen.getByText("login"));
    });

    expect(screen.getByTestId("authed").textContent).toBe("true");
    expect(screen.getByTestId("username").textContent).toBe("Jane Doe");
    expect(localStorage.getItem("preppilot_token")).toBe("fake-jwt");
  });

  test("logout clears stored session", async () => {
    loginApi.mockResolvedValue({
      data: { token: "fake-jwt", user: { id: "1", name: "Jane Doe" } },
    });

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    await act(async () => {
      await userEvent.click(screen.getByText("login"));
    });
    await act(async () => {
      await userEvent.click(screen.getByText("logout"));
    });

    expect(screen.getByTestId("authed").textContent).toBe("false");
    expect(localStorage.getItem("preppilot_token")).toBeNull();
  });
});
