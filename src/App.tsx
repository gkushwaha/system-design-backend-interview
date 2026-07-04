import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useStreak } from "@/hooks/useStreak";

function PageTransition() {
  const location = useLocation();
  return (
    <AnimatePresence mode="sync" initial={false}>
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        {/* tabIndex=0 (not -1) so this scrollable region is reachable via Tab, not just programmatic focus — axe's scrollable-region-focusable rule requires actual keyboard reachability */}
        <main tabIndex={0} className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 focus:outline-none">
          <PageTransition />
        </main>
      </div>
    </div>
  );
}

export default App;
