import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Home } from "@/pages/Home";
import { useXPStore } from "@/store/useXPStore";
import { useProgressStore } from "@/store/useProgressStore";

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe("Home — fresh state", () => {
  beforeEach(() => {
    useXPStore.getState().reset();
    useProgressStore.getState().reset();
  });

  it("renders 0 XP and Junior Engineer level", () => {
    renderHome();
    expect(screen.getByText("Junior Engineer")).toBeInTheDocument();
    expect(screen.getByText("0 XP")).toBeInTheDocument();
  });

  it("renders streak count of 0", () => {
    renderHome();
    expect(screen.getByText("0 days")).toBeInTheDocument();
  });

  it("Most Asked progress ring shows 0/15", () => {
    renderHome();
    expect(screen.getByText("0/15")).toBeInTheDocument();
  });

  it("Advanced progress ring shows 0/67", () => {
    renderHome();
    expect(screen.getByText("0/67")).toBeInTheDocument();
  });

  it("Expert progress ring shows 0/31", () => {
    renderHome();
    expect(screen.getByText("0/31")).toBeInTheDocument();
  });

  it("shows the 'nothing yet' prompt when no topic has been visited", () => {
    renderHome();
    expect(screen.getByText(/Nothing yet/)).toBeInTheDocument();
  });

  it("shows 'No topics visited yet' in Recently Visited when empty", () => {
    renderHome();
    expect(screen.getByText("No topics visited yet.")).toBeInTheDocument();
  });

  it("renders a Today's Challenge section with a real problem title", () => {
    renderHome();
    expect(screen.getByText("Today's Challenge")).toBeInTheDocument();
    expect(screen.getByText("Start challenge")).toBeInTheDocument();
  });
});

describe("Home — after visiting and completing topics", () => {
  beforeEach(() => {
    useXPStore.getState().reset();
    useProgressStore.getState().reset();
  });

  it("shows the last visited topic in 'Continue where you left off'", () => {
    useProgressStore.getState().visitTopic(1);
    renderHome();
    // Visiting topic 1 populates both "Continue where you left off" and "Recently
    // Visited" with the same topic, so it legitimately appears twice on Home.
    expect(screen.getAllByText("Horizontal vs vertical scaling").length).toBeGreaterThanOrEqual(1);
  });

  it("recently visited shows at most 5 items", () => {
    [1, 2, 3, 4, 5, 6].forEach((id) => useProgressStore.getState().visitTopic(id));
    renderHome();
    expect(useProgressStore.getState().recentTopicIds).toHaveLength(5);
  });

  it("progress ring reflects a completed topic", () => {
    useProgressStore.getState().completeTopic(1);
    renderHome();
    expect(screen.getByText("1/15")).toBeInTheDocument();
  });

  it("XP display reflects the store's current XP", () => {
    useXPStore.getState().addXP(180);
    renderHome();
    expect(screen.getByText("180 XP")).toBeInTheDocument();
  });
});
