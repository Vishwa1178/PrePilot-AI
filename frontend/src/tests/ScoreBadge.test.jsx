import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreBadge from "../components/ScoreBadge";

describe("ScoreBadge", () => {
  test("renders a dash when score is null", () => {
    render(<ScoreBadge score={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  test("renders the score out of 10", () => {
    render(<ScoreBadge score={8} />);
    expect(screen.getByText("8/10")).toBeInTheDocument();
  });

  test("applies the green (good score) style for scores >= 7", () => {
    render(<ScoreBadge score={9} />);
    expect(screen.getByText("9/10")).toHaveClass("bg-green-100");
  });

  test("applies the amber (mid score) style for scores between 4 and 6", () => {
    render(<ScoreBadge score={5} />);
    expect(screen.getByText("5/10")).toHaveClass("bg-amber-100");
  });

  test("applies the red (low score) style for scores below 4", () => {
    render(<ScoreBadge score={2} />);
    expect(screen.getByText("2/10")).toHaveClass("bg-red-100");
  });
});
