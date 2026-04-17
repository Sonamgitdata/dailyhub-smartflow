import { motion } from "framer-motion";
import type { Provider } from "@/data/services";

export function ProviderRow({
  provider,
  index,
  unitLabel,
  onSelect,
}: {
  provider: Provider;
  index: number;
  unitLabel: string;
  onSelect: (p: Provider) => void;
}) {
  const isBest = provider.tag === "Best Choice";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className={`glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 relative overflow-hidden ${
        isBest ? "ring-1 ring-primary/60 glow-mint" : ""
      }`}
    >
      {isBest && (
        <div className="absolute -top-px left-6 px-3 py-1 rounded-b-lg gradient-aurora text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          ✨ Best Choice
        </div>
      )}
      <div className="flex-1 min-w-0 pt-2 sm:pt-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold truncate">{provider.name}</h4>
          <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">
            ★ {provider.rating}
          </span>
        </div>
        {provider.meta && (
          <p className="text-xs text-muted-foreground mt-0.5">{provider.meta}</p>
        )}
      </div>
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">ETA</div>
          <div className="font-semibold tabular-nums">
            {provider.etaMinutes < 2 ? "Instant" : `${provider.etaMinutes} min`}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</div>
          <div className="font-semibold tabular-nums">₹{provider.price}</div>
        </div>
      </div>
      <button
        onClick={() => onSelect(provider)}
        className={`shrink-0 px-5 py-2.5 rounded-xl font-medium text-sm transition-transform hover:scale-105 ${
          isBest
            ? "gradient-aurora text-primary-foreground glow-mint"
            : "glass-strong text-foreground hover:bg-white/10"
        }`}
      >
        {unitLabel === "payment" ? "Pay" : "Book"}
      </button>
    </motion.div>
  );
}
