import { useEffect, useRef, useState, type RefObject } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useStreak } from "@/hooks/useStreak";

// Tracks whether the app has ever rendered real route content, across this
// component's whole lifetime (it never unmounts between in-app navigations).
let hasMountedOnce = false;

function PageTransition({ scrollContainerRef }: { scrollContainerRef: RefObject<HTMLElement | null> }) {
  const location = useLocation();

  // <main> never unmounts between in-app route changes (only the Outlet's
  // child swaps), so its scroll position was carrying over from whatever
  // page you navigated away from — e.g. scrolling halfway down a long topic
  // page, then clicking a different topic in the sidebar, would land on the
  // new page already scrolled down, looking like a big blank gap above the
  // content. Reset it to the top on every route change.
  useEffect(() => {
    scrollContainerRef.current?.scrollTo(0, 0);
  }, [location.pathname, scrollContainerRef]);
  // AnimatePresence's `initial={false}` was meant to skip the fade on the very
  // first paint, but it raced the lazy-loaded route chunk (React only mounts
  // this component once the chunk resolves) and could leave the page stuck at
  // a partial or zero opacity forever on a real (non-instant) network — a
  // serious production bug where content silently never became visible. Doing
  // the "is this the first paint" check ourselves, outside framer-motion,
  // sidesteps that race entirely: the very first route always renders with no
  // animation wrapper, guaranteeing it's visible immediately.
  const [skipInitialAnimation] = useState(() => {
    const isFirst = !hasMountedOnce;
    hasMountedOnce = true;
    return isFirst;
  });

  if (skipInitialAnimation) {
    return <Outlet />;
  }

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  useStreak();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        {/* tabIndex=0 (not -1) so this scrollable region is reachable via Tab, not just programmatic focus — axe's scrollable-region-focusable rule requires actual keyboard reachability */}
        <main
          ref={mainRef}
          tabIndex={0}
          className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 focus:outline-none"
        >
          <PageTransition scrollContainerRef={mainRef} />
        </main>
      </div>
    </div>
  );
}

export default App;
