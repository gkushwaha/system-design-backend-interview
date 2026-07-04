# System Design & Backend Interview Prep

An interactive, gamified learning tool for backend system design interviews — Duolingo-style skill tree, animated interactive diagrams instead of static slides, a capacity calculator, and a timed whiteboard interview simulation.

## Tech stack

- React 19 + Vite 8, TypeScript (strict mode)
- Tailwind CSS v4
- Framer Motion — all animations
- Recharts — data visualizations (lazy-loaded, code-split from the main bundle)
- Zustand — XP and progress state, persisted to `localStorage`
- React Router v7 (`HashRouter`, so it works on GitHub Pages with no server config)
- Lucide React — icons

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
```

## Project structure

```
src/
  pages/                  Route-level pages (Home, TopicMap, TopicPage, SystemDesign, QuickRef, Quiz, InterviewSimulation)
  components/
    visualizations/       One bespoke interactive component per topic (sliders, toggles, click-to-explore)
    problem/               Shared system-design-problem components (RequirementsPanel, SolutionBuilder,
                           ArchitectureCanvas, CapacityCalculator, KeyDecisionsPanel, CommonMistakesPanel, CompanyNote)
    topic/                 Shared topic-tab components (HowItWorksStepper, TradeoffsPanel, InterviewAnswerPanel, MiniChallenge)
    skilltree/             Pannable/zoomable skill tree canvas
    interview/             Whiteboard canvas for Interview Simulation mode
    layout/                Sidebar, Navbar, Breadcrumb
    ui/                    Button, Badge, Card, Tabs, ProgressRing — built from scratch with Tailwind
  data/
    topics.ts              All 113 topic definitions (Most Asked / Advanced / Expert tiers)
    problems.ts             All 30 system design problem definitions
    topicContent/           Per-topic content (visual + how-it-works + tradeoffs + interview answer + mini challenge),
                            lazily loaded per slug via dynamic import — see index.ts
    problemContent/         Per-problem content (requirements, solution steps, capacity calc, decisions, mistakes,
                            company note), also lazily loaded per slug
  store/                   Zustand stores: useXPStore (XP/level), useProgressStore (completion, streak, history)
  hooks/                   useXP, useProgress, useStreak — thin wrappers around the stores plus derived data
```

## Content coverage

Every topic and problem is navigable and awards XP on completion. A subset has fully bespoke interactive
content (animated visualization + how-it-works + tradeoffs + interview script + mini challenge); the rest
use a functional placeholder (real-world example + all tabs + mark-complete) until they're filled in.

| Tier | Bespoke content | Total |
|---|---|---|
| Most Asked topics | 15 | 15 |
| Advanced topics | 13 (one flagship per group) | 67 |
| Expert topics | 6 (one flagship per group) | 31 |
| Problems | 13 (7 Most Asked + 6 flagship) | 30 |

## Key architectural notes

- **Lazy loading**: `topicContent/index.ts` and `problemContent/index.ts` export a map of slug → dynamic
  `import()` loader rather than eagerly importing every content module. `TopicPage.tsx` and `SystemDesign.tsx`
  resolve the loader on mount, so each topic/problem's visualization ships as its own chunk.
- **Route-level code splitting**: every page except `Home` is `React.lazy`-loaded in `main.tsx`.
- **Progress/XP persistence**: `useProgressStore` and `useXPStore` persist to `localStorage` via Zustand's
  `persist` middleware — no backend.
- **Skill tree unlock logic**: Advanced unlocks after 8 Most Asked topics are completed; Expert unlocks after
  20 Advanced topics. See `useProgress.ts` and `ADVANCED_UNLOCK_THRESHOLD` / `EXPERT_UNLOCK_THRESHOLD` in `data/topics.ts`.
- **Interview Simulation's "replay" mode** reuses the same `SolutionBuilder` component from the System Design
  problem pages to show the model answer walkthrough.

## Deployment

```bash
npm run deploy   # builds and pushes dist/ to the gh-pages branch
```

Configured for GitHub Pages via `vite.config.ts` (`base: '/system-design-backend-interview/'`) and
`react-router-dom`'s `HashRouter`, so no server-side rewrite rules are needed.
