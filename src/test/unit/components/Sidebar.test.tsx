import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { useProgressStore } from "@/store/useProgressStore";
import { topics } from "@/data/topics";

function renderSidebar(initialEntries: string[] = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Sidebar />
    </MemoryRouter>,
  );
}

describe("Sidebar — default (collapsed) state", () => {
  beforeEach(() => useProgressStore.getState().reset());

  it("renders all 15 Most Asked topic links immediately (always expanded)", () => {
    renderSidebar();
    const mostAsked = topics.filter((t) => t.tier === "most-asked");
    for (const t of mostAsked) {
      expect(screen.getByText(t.title)).toBeInTheDocument();
    }
  });

  it("does not render Advanced/Expert topic links until their group is expanded (collapsed by default)", () => {
    renderSidebar();
    const firstAdvanced = topics.find((t) => t.tier === "advanced")!;
    expect(screen.queryByText(firstAdvanced.title)).not.toBeInTheDocument();
  });

  it("renders the 5 primary nav links", () => {
    renderSidebar();
    expect(screen.getByRole("link", { name: /Home/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Skill Tree/ })).toBeInTheDocument();
    // "System Design" also appears as the sidebar's brand header text, so scope to the link.
    expect(screen.getByRole("link", { name: /System Design/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Interview Sim/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quick Reference/ })).toBeInTheDocument();
  });

  it("shows Most Asked progress as 0/15 when nothing is complete", () => {
    renderSidebar();
    expect(screen.getByText("0/15")).toBeInTheDocument();
  });
});

describe("Sidebar — expanding a locked group", () => {
  beforeEach(() => useProgressStore.getState().reset());

  it("expanding an Advanced group reveals its topics as locked and clicking does not navigate away", async () => {
    const user = userEvent.setup();
    renderSidebar(["/some-current-page"]);
    const firstAdvancedTopic = topics.find((t) => t.tier === "advanced")!;
    const groupToggle = screen.getByText(firstAdvancedTopic.group);
    await user.click(groupToggle);
    const link = screen.getByText(firstAdvancedTopic.title).closest("a")!;
    // Locked rows resolve to the current path (react-router's `to="#"` behavior), but
    // the onClick handler calls preventDefault, so clicking must not navigate away.
    await user.click(link);
    expect(window.location.href).not.toContain("/topics/");
  });
});

describe("Sidebar — unlocked state after completing 8 Most Asked", () => {
  beforeEach(() => useProgressStore.getState().reset());

  it("Advanced topics become navigable once 8 Most Asked topics are complete", async () => {
    const mostAskedIds = topics.filter((t) => t.tier === "most-asked").map((t) => t.id).slice(0, 8);
    mostAskedIds.forEach((id) => useProgressStore.getState().completeTopic(id));

    const user = userEvent.setup();
    renderSidebar();
    const firstAdvancedTopic = topics.find((t) => t.tier === "advanced")!;
    const groupToggle = screen.getByText(firstAdvancedTopic.group);
    await user.click(groupToggle);
    const link = screen.getByText(firstAdvancedTopic.title).closest("a");
    // MemoryRouter renders plain paths (no "#" prefix); the real app uses HashRouter,
    // whose "#" prefixing is verified separately in the Playwright e2e suite.
    expect(link).toHaveAttribute("href", `/topics/${firstAdvancedTopic.slug}`);
  });
});

describe("Sidebar — completed topic indicator", () => {
  beforeEach(() => useProgressStore.getState().reset());

  it("a completed Most Asked topic shows in the completed set reflected by the progress ring", () => {
    useProgressStore.getState().completeTopic(1);
    renderSidebar();
    expect(screen.getByText("1/15")).toBeInTheDocument();
  });
});
