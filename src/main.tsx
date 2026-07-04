import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Loader2 } from "lucide-react";
import "./index.css";
import App from "./App.tsx";
import { Home } from "@/pages/Home";

const TopicMap = lazy(() => import("@/pages/TopicMap").then((m) => ({ default: m.TopicMap })));
const TopicPage = lazy(() => import("@/pages/TopicPage").then((m) => ({ default: m.TopicPage })));
const SystemDesign = lazy(() => import("@/pages/SystemDesign").then((m) => ({ default: m.SystemDesign })));
const QuickRef = lazy(() => import("@/pages/QuickRef").then((m) => ({ default: m.QuickRef })));
const Quiz = lazy(() => import("@/pages/Quiz").then((m) => ({ default: m.Quiz })));
const InterviewSimulation = lazy(() =>
  import("@/pages/InterviewSimulation").then((m) => ({ default: m.InterviewSimulation })),
);

function RouteFallback() {
  return (
    <div className="flex h-64 w-full items-center justify-center gap-2 text-sm text-muted">
      <Loader2 size={16} className="animate-spin" />
      Loading…
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* reducedMotion="user" honors the OS-level prefers-reduced-motion setting (WCAG 2.3.3) */}
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<App />}>
              <Route index element={<Home />} />
              <Route path="map" element={<TopicMap />} />
              <Route path="topics/:slug" element={<TopicPage />} />
              <Route path="problems" element={<SystemDesign />} />
              <Route path="problems/:slug" element={<SystemDesign />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="reference" element={<QuickRef />} />
              <Route path="interview" element={<InterviewSimulation />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </MotionConfig>
  </StrictMode>,
);
