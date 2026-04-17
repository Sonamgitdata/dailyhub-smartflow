import { motion } from "framer-motion";
import type { Preference } from "@/data/services";

const OPTIONS: { key: Preference; label: string; hint: string; icon: string }[] = [
  { key: "cheap", label: "Cheapest", hint: "Lowest price wins", icon: "💸" },
  { key: "fast", label: "Fastest", hint: "Shortest ETA wins", icon: "⚡" },
  { key: "best", label: "Best rated", hint: "Top reviews win", icon: "⭐" },
];

export function PreferencePicker({
  value,
  onChange,
}: {
  value: Preference;
  onChange: (v: Preference) => void;
}) {
  return (
    <div className="glass rounded-2xl p-1.5 inline-flex gap-1 relative">
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className="relative px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            {active && (
              <motion.span
                layoutId="pref-pill"
                className="absolute inset-0 rounded-xl gradient-aurora glow-mint"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-1.5 ${
                active ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export const PREF_HINTS: Record<Preference, string> = {
  cheap: "Optimizing for the lowest price",
  fast: "Optimizing for the shortest wait",
  best: "Optimizing for top-rated providers",
};
