import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { AuroraBackdrop } from "@/components/AuroraBackdrop";
import { ServiceCard } from "@/components/ServiceCard";
import { PreferencePicker, PREF_HINTS } from "@/components/PreferencePicker";
import { PaymentDialog } from "@/components/PaymentDialog";
import {
  rankProviders,
  SERVICES,
  SERVICE_LIST,
  type Preference,
  type Provider,
} from "@/data/services";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [pref, setPref] = useState<Preference>("best");
  const [combo, setCombo] = useState<Provider | null>(null);

  const topPicks = useMemo(() => {
    return SERVICE_LIST.slice(0, 3).map((key) => {
      const cfg = SERVICES[key];
      const ranked = rankProviders(cfg.providers, pref);
      return { cfg, best: ranked[0] };
    });
  }, [pref]);

  const handleCombo = () => {
    // Combine top transport + top food picks into one "combo" payment
    const ride = rankProviders(SERVICES.transport.providers, pref)[0];
    const food = rankProviders(SERVICES.food.providers, pref)[0];
    setCombo({
      id: "combo-1",
      name: `${ride.name} + ${food.name}`,
      price: ride.price + food.price,
      etaMinutes: Math.max(ride.etaMinutes, food.etaMinutes),
      rating: Number(((ride.rating + food.rating) / 2).toFixed(1)),
      meta: "🚕 Cab + 🍔 Food • Coordinated arrival",
    });
  };

  return (
    <div className="min-h-screen relative">
      <AuroraBackdrop />

      {/* Nav */}
      <header className="relative z-20 px-5 sm:px-8 lg:px-12 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl gradient-aurora glow-violet flex items-center justify-center font-bold text-primary-foreground">
            D
          </div>
          <div className="font-display font-semibold text-lg tracking-tight">DailyHub</div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
          AI engine online
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-5 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground">
            <span>✨</span>
            One app · All services · Smart living
          </div>
          <h1 className="mt-5 text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Your day,
            <br />
            <span className="text-aurora">orchestrated.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
            Transport, food, healthcare, home and payments — unified under one
            AI that picks the smartest option for you in real time.
          </p>
        </motion.div>

        {/* Preference */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <PreferencePicker value={pref} onChange={setPref} />
          <p className="text-sm text-muted-foreground">{PREF_HINTS[pref]}</p>
        </motion.div>
      </section>

      {/* Top picks strip */}
      <section className="relative z-10 px-5 sm:px-8 lg:px-12 pb-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
            AI top picks for you
          </h2>
          <button
            onClick={handleCombo}
            className="text-xs sm:text-sm px-4 py-2 rounded-full glass-strong hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <span>⚡</span>
            <span>Combo: cab + food</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPicks.map(({ cfg, best }, i) => (
            <motion.div
              key={cfg.key}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full gradient-aurora opacity-20 blur-2xl" />
              <div className="flex items-center justify-between">
                <span className="text-2xl">{cfg.emoji}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full gradient-aurora text-primary-foreground">
                  Best
                </span>
              </div>
              <div className="mt-3 font-semibold">{best.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                ₹{best.price} · {best.etaMinutes < 2 ? "Instant" : `${best.etaMinutes}m`} · ★ {best.rating}
              </div>
              <Link
                to="/service/$serviceKey"
                params={{ serviceKey: cfg.key }}
                className="mt-4 inline-flex text-xs text-primary hover:gap-2 gap-1 transition-all"
              >
                See all {cfg.title.toLowerCase()} →
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All services grid */}
      <section className="relative z-10 px-5 sm:px-8 lg:px-12 pb-20">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
          All services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {SERVICE_LIST.map((key, i) => (
            <ServiceCard key={key} service={SERVICES[key]} index={i} />
          ))}
        </div>
      </section>

      <footer className="relative z-10 px-5 sm:px-8 lg:px-12 pb-10 text-center text-xs text-muted-foreground">
        DailyHub demo · Mock data · No real charges
      </footer>

      <PaymentDialog
        open={!!combo}
        provider={combo}
        unitLabel="combo"
        onClose={() => setCombo(null)}
      />
    </div>
  );
}
