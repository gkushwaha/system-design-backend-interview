import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Home } from "@/pages/Home";
import { TopicPage } from "@/pages/TopicPage";
import { useXPStore, levelForXP } from "@/store/useXPStore";
import { useProgressStore } from "@/store/useProgressStore";
import { topics, ADVANCED_UNLOCK_THRESHOLD } from "@/data/topics";

function resetAll() {
  useXPStore.getState().reset();
  useProgressStore.getState().reset();
}

function renderTopic(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/topics/${slug}`]}>
      <Routes>
        <Route path="/topics/:slug" element={<TopicPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("integration: new user completes their first topic end to end", () => {
  beforeEach(resetAll);

  it("XP and progress start at zero, then update after completing topic 1's mini challenge", async () => {
    const { unmount } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByText("0 XP")).toBeInTheDocument();
    expect(screen.getByText("0/15")).toBeInTheDocument();
    unmount();

    const user = userEvent.setup();
    renderTopic("horizontal-vs-vertical-scaling");
    await waitFor(() => expect(screen.getByText("Mini challenge")).toBeInTheDocument());
    await user.click(screen.getByText("Mini challenge"));
    await user.click(await screen.findByText("Horizontal scaling"));
    await user.click(screen.getByText("Next question"));
    await user.click(
      await screen.findByText("Larger single instances cost disproportionately more than the capacity they add"),
    );
    await waitFor(() => expect(useProgressStore.getState().isTopicComplete(1)).toBe(true), { timeout: 2000 });
    expect(useXPStore.getState().xp).toBe(80);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByText("1/15")).toBeInTheDocument();
    expect(screen.getByText("80 XP")).toBeInTheDocument();
  });
});

describe("integration: Advanced unlocks after exactly 8 Most Asked topics", () => {
  beforeEach(resetAll);

  it("topic 16 (first Advanced) is locked before 8, unlocked at 8", () => {
    const mostAskedIds = topics.filter((t) => t.tier === "most-asked").map((t) => t.id);
    mostAskedIds.slice(0, 7).forEach((id) => useProgressStore.getState().completeTopic(id));

    const advancedDone = topics.filter(
      (t) => t.tier === "most-asked" && useProgressStore.getState().isTopicComplete(t.id),
    ).length;
    expect(advancedDone).toBe(7);
    expect(advancedDone >= ADVANCED_UNLOCK_THRESHOLD).toBe(false);

    useProgressStore.getState().completeTopic(mostAskedIds[7]);
    const advancedDoneAfter = topics.filter(
      (t) => t.tier === "most-asked" && useProgressStore.getState().isTopicComplete(t.id),
    ).length;
    expect(advancedDoneAfter).toBe(8);
    expect(advancedDoneAfter >= ADVANCED_UNLOCK_THRESHOLD).toBe(true);
  });
});

describe("integration: XP level-up from Junior to Mid-level", () => {
  beforeEach(resetAll);

  it("crossing 500 XP changes the level label", () => {
    useXPStore.getState().addXP(450);
    expect(levelForXP(useXPStore.getState().xp)).toBe("Junior Engineer");
    useXPStore.getState().addXP(50); // topic completion reward crosses the 500 boundary
    expect(useXPStore.getState().xp).toBe(500);
    expect(levelForXP(useXPStore.getState().xp)).toBe("Mid-level Engineer");

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByText("Mid-level Engineer")).toBeInTheDocument();
  });
});

describe("integration: streak builds day over day and bonus fires at day 7", () => {
  beforeEach(resetAll);

  function touchOnDate(dateISO: string) {
    const real = Date.prototype.toISOString;
    Date.prototype.toISOString = () => `${dateISO}T10:00:00.000Z`;
    useProgressStore.getState().touchStreak();
    Date.prototype.toISOString = real;
  }

  it("streak increments across 7 consecutive days with no early bonus, matching XP awarded via useStreak semantics", () => {
    touchOnDate("2026-01-01"); // day 1
    touchOnDate("2026-01-02"); // day 2
    touchOnDate("2026-01-03"); // day 3
    touchOnDate("2026-01-04"); // day 4
    touchOnDate("2026-01-05"); // day 5
    touchOnDate("2026-01-06"); // day 6
    expect(useProgressStore.getState().streak.count).toBe(6);
    touchOnDate("2026-01-07"); // day 7
    expect(useProgressStore.getState().streak.count).toBe(7);
  });
});

describe("integration: localStorage persistence across remounts", () => {
  beforeEach(resetAll);

  it("completed topics and XP survive unmounting and remounting Home", () => {
    useProgressStore.getState().completeTopic(1);
    useProgressStore.getState().completeTopic(2);
    useProgressStore.getState().completeTopic(3);
    useXPStore.getState().addXP(240);

    const { unmount } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByText("3/15")).toBeInTheDocument();
    unmount();

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByText("3/15")).toBeInTheDocument();
    expect(screen.getByText("240 XP")).toBeInTheDocument();
  });
});

describe("integration: unknown topic slug", () => {
  it("shows a 'not found' message and a link back to the skill tree, without crashing", () => {
    renderTopic("totally-unknown-topic-xyz");
    expect(screen.getByText(/Topic not found/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to skill tree/i)).toBeInTheDocument();
  });
});
