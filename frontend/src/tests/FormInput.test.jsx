import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormInput from "../components/FormInput";

describe("FormInput", () => {
  test("renders the label and connects it to the input via htmlFor/id", () => {
    render(<FormInput label="Email" name="email" value="" onChange={() => {}} />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "email");
  });

  test("calls onChange when the user types", async () => {
    const handleChange = vi.fn();
    render(<FormInput label="Name" name="name" value="" onChange={handleChange} />);

    await userEvent.type(screen.getByLabelText("Name"), "a");
    expect(handleChange).toHaveBeenCalled();
  });

  test("passes through the type prop (e.g. password fields are masked)", () => {
    render(<FormInput label="Password" name="password" type="password" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });
});
