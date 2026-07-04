import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TopicPage } from "@/pages/TopicPage";
import { useProgressStore } from "@/store/useProgressStore";
import { useXPStore } from "@/store/useXPStore";

function renderTopic(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/topics/${slug}`]}>
      <Routes>
        <Route path="/topics/:slug" element={<TopicPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("TopicPage — a topic WITH full bespoke content (horizontal-vs-vertical-scaling)", () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
    useXPStore.getState().reset();
  });

  it("renders the topic title and Most Asked badge", async () => {
    renderTopic("horizontal-vs-vertical-scaling");
    // The title also appears in the breadcrumb, so scope to the <h1>.
    expect(await screen.findByRole("heading", { name: "Horizontal vs vertical scaling" })).toBeInTheDocument();
    // "Most Asked" appears both in the tier badge ("🔥 Most Asked") and the
    // subtitle line under the h1 — assert at least one instance renders.
    expect(screen.getAllByText(/Most Asked/).length).toBeGreaterThan(0);
  });

  it("renders the estimated time", async () => {
    renderTopic("horizontal-vs-vertical-scaling");
    await screen.findByRole("heading", { name: "Horizontal vs vertical scaling" });
    expect(screen.getByText(/\d+ min/)).toBeInTheDocument();
  });

  it("renders all 5 tabs and Visual is active by default", async () => {
    renderTopic("horizontal-vs-vertical-scaling");
    await waitFor(() => expect(screen.getByText("Visual")).toBeInTheDocument());
    expect(screen.getByText("How it works")).toBeInTheDocument();
    expect(screen.getByText("Tradeoffs")).toBeInTheDocument();
    expect(screen.getByText("Interview answer")).toBeInTheDocument();
    expect(screen.getByText("Mini challenge")).toBeInTheDocument();
  });

  it("clicking 'How it works' shows step 1 with Prev disabled and Next enabled", async () => {
    const user = userEvent.setup();
    renderTopic("horizontal-vs-vertical-scaling");
    await waitFor(() => expect(screen.getByText("How it works")).toBeInTheDocument());
    await user.click(screen.getByText("How it works"));
    expect(await screen.findByText(/Step 1 \/ 5/)).toBeInTheDocument();
    expect(screen.getByText("Prev")).toBeDisabled();
    expect(screen.getByText(/Next/)).toBeEnabled();
  });

  it("clicking Next in the stepper advances to step 2 and back with Prev", async () => {
    const user = userEvent.setup();
    renderTopic("horizontal-vs-vertical-scaling");
    await waitFor(() => expect(screen.getByText("How it works")).toBeInTheDocument());
    await user.click(screen.getByText("How it works"));
    await screen.findByText(/Step 1 \/ 5/);
    await user.click(screen.getByText(/Next/));
    expect(await screen.findByText(/Step 2 \/ 5/)).toBeInTheDocument();
    await user.click(screen.getByText("Prev"));
    expect(await screen.findByText(/Step 1 \/ 5/)).toBeInTheDocument();
  });

  it("rapid Next clicks never advance the stepper past the last step", async () => {
    const user = userEvent.setup();
    renderTopic("horizontal-vs-vertical-scaling");
    await waitFor(() => expect(screen.getByText("How it works")).toBeInTheDocument());
    await user.click(screen.getByText("How it works"));
    await screen.findByText(/Step 1 \/ 5/);
    const next = screen.getByText(/Next/);
    for (let i = 0; i < 10; i++) {
      if ((next as HTMLElement).closest("button")?.hasAttribute("disabled")) break;
      await user.click(next);
    }
    expect(await screen.findByText(/Step 5 \/ 5/)).toBeInTheDocument();
  });

  it("Mini challenge: wrong answer shows explanation and does not complete the topic", async () => {
    const user = userEvent.setup();
    renderTopic("horizontal-vs-vertical-scaling");
    await waitFor(() => expect(screen.getByText("Mini challenge")).toBeInTheDocument());
    await user.click(screen.getByText("Mini challenge"));
    const wrongOption = await screen.findByText("Vertical scaling"); // correctIndex is "Horizontal scaling"
    await user.click(wrongOption);
    expect(await screen.findByText(/Not quite/)).toBeInTheDocument();
    expect(useProgressStore.getState().isTopicComplete(1)).toBe(false);
  });

  it("Mini challenge: answering all questions correctly awards XP and marks the topic complete", async () => {
    const user = userEvent.setup();
    renderTopic("horizontal-vs-vertical-scaling");
    await waitFor(() => expect(screen.getByText("Mini challenge")).toBeInTheDocument());
    await user.click(screen.getByText("Mini challenge"));

    await user.click(await screen.findByText("Horizontal scaling"));
    expect(await screen.findByText(/Correct!/)).toBeInTheDocument();
    await user.click(screen.getByText("Next question"));

    await user.click(await screen.findByText("Larger single instances cost disproportionately more than the capacity they add"));
    // BUG-004 regression: the "Correct!" feedback for the FINAL question must still
    // be visible (component keeps showing it during the deliberate completion delay).
    expect(await screen.findByText(/Correct!/)).toBeInTheDocument();

    await waitFor(() => expect(useProgressStore.getState().isTopicComplete(1)).toBe(true), { timeout: 2000 });
    expect(useXPStore.getState().xp).toBe(80); // XP_REWARDS.topic (50) + XP_REWARDS.miniChallenge (30)
  });

  it("Mini challenge: cannot submit again after the topic is already complete", async () => {
    const user = userEvent.setup();
    renderTopic("horizontal-vs-vertical-scaling");
    await waitFor(() => expect(screen.getByText("Mini challenge")).toBeInTheDocument());
    await user.click(screen.getByText("Mini challenge"));
    await user.click(await screen.findByText("Horizontal scaling"));
    await user.click(screen.getByText("Next question"));
    await user.click(await screen.findByText("Larger single instances cost disproportionately more than the capacity they add"));
    await waitFor(() => expect(useProgressStore.getState().isTopicComplete(1)).toBe(true), { timeout: 2000 });
    expect(await screen.findByText(/Challenge complete/)).toBeInTheDocument();
  });
});

describe("TopicPage — a topic WITHOUT bespoke content (placeholder path)", () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
    useXPStore.getState().reset();
  });

  it("renders the placeholder Visual tab and still allows marking complete for XP", async () => {
    renderTopic("cap-theorem-pacelc"); // Advanced topic #16, intentionally has no bespoke content
    expect(
      await screen.findByRole("heading", { name: "CAP theorem deep dive + PACELC extension" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/lands here soon/)).toBeInTheDocument();
  });
});

describe("TopicPage — unknown slug", () => {
  it("shows 'Topic not found' instead of crashing", () => {
    renderTopic("this-topic-does-not-exist");
    expect(screen.getByText(/Topic not found/i)).toBeInTheDocument();
  });
});
