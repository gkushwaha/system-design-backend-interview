import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Home } from "@/pages/Home";

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe("Home — informational landing page", () => {
  it("renders the headline and intro copy", () => {
    renderHome();
    expect(screen.getByRole("heading", { name: /Master system design interviews/i })).toBeInTheDocument();
  });

  it("renders the 'How to use this' walkthrough with all four steps", () => {
    renderHome();
    expect(screen.getByText("How to use this")).toBeInTheDocument();
    // Each step name also appears in its own quick-link card below, so these
    // legitimately match twice — just assert at least one instance renders.
    expect(screen.getAllByText("Skill Tree").length).toBeGreaterThan(0);
    expect(screen.getAllByText("System Design Problems").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Interview Simulation").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Quick Reference").length).toBeGreaterThan(0);
  });

  it("renders quick-link cards to all four sections with correct hrefs", () => {
    renderHome();
    expect(screen.getByRole("link", { name: /Skill Tree/i })).toHaveAttribute("href", "/map");
    expect(screen.getByRole("link", { name: /System Design Problems/i })).toHaveAttribute("href", "/problems");
    expect(screen.getByRole("link", { name: /Interview Simulation/i })).toHaveAttribute("href", "/interview");
    expect(screen.getByRole("link", { name: /Quick Reference/i })).toHaveAttribute("href", "/reference");
  });

  it("renders a call to action linking to the skill tree", () => {
    renderHome();
    expect(screen.getByRole("link", { name: /Start with Most Asked topics/i })).toHaveAttribute("href", "/map");
  });

  it("does not render any progress-tracking UI (XP, streak, rings)", () => {
    renderHome();
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument();
    expect(screen.queryByText(/streak/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Today's Challenge")).not.toBeInTheDocument();
    expect(screen.queryByText("Continue where you left off")).not.toBeInTheDocument();
  });
});
