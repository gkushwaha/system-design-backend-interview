# System Design & Backend Interview Prep

🌐 **Live:** https://gkushwaha.github.io/system-design-backend-interview/

A free, self-contained curriculum for backend system design interviews — a Duolingo-style skill
tree, animated interactive diagrams instead of static slides, a capacity calculator, and a timed
whiteboard interview simulation. XP/streak/level gamification tracks your progress in the
background (sidebar + navbar), but the Home page itself is a plain orientation page: what this is
and how to use it, not a dashboard.

## Tech stack

- React 19 + Vite 8, TypeScript (strict mode)
- Tailwind CSS v4
- Framer Motion — all animations (respects `prefers-reduced-motion` via `MotionConfig`)
- Recharts — data visualizations (lazy-loaded, code-split from the main bundle)
- Zustand — XP and progress state, persisted to `localStorage`
- React Router v7 (`HashRouter`, so it works on GitHub Pages with no server config)
- Lucide React — icons
- Vitest + React Testing Library — unit/integration tests
- Playwright + axe-core — end-to-end and accessibility tests

## Getting started

Requires Node 18+.

```bash
git clone https://github.com/gkushwaha/system-design-backend-interview.git
cd system-design-backend-interview
npm install
npm run dev       # start the dev server at http://localhost:5173
```

Other useful commands:

```bash
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
  test/
    unit/                  Vitest unit tests: stores, data integrity, content accuracy, components
    integration/           Multi-component user-journey tests
e2e/                       Playwright end-to-end tests (critical paths, responsive, accessibility,
                            dark mode, persistence, error handling)
  regression/               One test per fixed bug, named `REGRESSION BUG-XXX: <description>`
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

## Testing

```bash
npm test               # Vitest in watch mode
npm run test:run       # Vitest, single run
npm run test:coverage  # Vitest with a coverage report
npm run test:e2e       # Playwright, headless (desktop Chrome + a Pixel 5 mobile-emulated project)
npm run test:e2e:ui    # Playwright's interactive UI mode
npm run test:all       # coverage run + full E2E suite
```

Accessibility is checked automatically: `e2e/accessibility.spec.ts` runs an `axe-core` scan against
every major route and asserts zero critical/serious violations, plus a keyboard-navigation and an
icon-button-labeling check. `e2e/regression/regression.spec.ts` holds one permanent test per bug
that's been found and fixed, so none of them can silently reappear.

## Key architectural notes

- **Lazy loading**: `topicContent/index.ts` and `problemContent/index.ts` export a map of slug → dynamic
  `import()` loader rather than eagerly importing every content module. `TopicPage.tsx` and `SystemDesign.tsx`
  resolve the loader on mount, so each topic/problem's visualization ships as its own chunk.
- **Route-level code splitting**: every page except `Home` is `React.lazy`-loaded in `main.tsx`.
- **Progress/XP persistence**: `useProgressStore` and `useXPStore` persist to `localStorage` via Zustand's
  `persist` middleware — no backend.
- **No topic is ever locked** — every Most Asked, Advanced, and Expert topic is navigable from a
  completely fresh profile, in any order.
- **Interview Simulation's "replay" mode** reuses the same `SolutionBuilder` component from the System Design
  problem pages to show the model answer walkthrough.
- **First-paint animation is skipped explicitly** (`App.tsx`'s `PageTransition`): relying on
  `AnimatePresence`'s `initial={false}` alone raced the lazy-loaded route chunk and could leave content
  stuck at partial opacity on a real network. A module-level flag detects the true first render and
  renders it with no animation wrapper at all — only in-app route changes get the crossfade.
- **Scroll position resets on route change**: `<main>` never unmounts between in-app navigations, so its
  `scrollTop` was carrying over from whatever page you navigated away from. `App.tsx` resets it to 0 via
  a shared ref whenever the route changes.

## Deployment

```bash
npm run deploy   # builds and pushes dist/ to the gh-pages branch
```

Configured for GitHub Pages via `vite.config.ts` (`base: '/system-design-backend-interview/'`) and
`react-router-dom`'s `HashRouter`, so no server-side rewrite rules are needed.
