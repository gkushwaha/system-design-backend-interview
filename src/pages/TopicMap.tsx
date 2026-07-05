import { motion } from "framer-motion";
import { SkillTreeCanvas } from "@/components/skilltree/SkillTreeCanvas";

export function TopicMap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-semibold text-text">Skill Tree</h1>
        <p className="mt-1 text-sm text-muted">
          Every topic is open — jump to whatever you want to study, in any order.
        </p>
      </div>

      <SkillTreeCanvas />
    </motion.div>
  );
}
