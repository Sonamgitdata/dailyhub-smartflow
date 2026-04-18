import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AuroraBackdrop } from "@/components/AuroraBackdrop";
import { PreferencePicker, PREF_HINTS } from "@/components/PreferencePicker";
import { ProviderRow } from "@/components/ProviderRow";
import { PaymentDialog } from "@/components/PaymentDialog";
import {
  rankProviders,
  SERVICES,
  type Preference,
  type Provider,
  type ServiceKey,
} from "@/data/services";
import { apiEnabled, fetchProviders } from "@/lib/api";

const VALID: ServiceKey[] = ["transport", "food", "healthcare", "home", "payments"];

export const Route = createFileRoute("/service/$serviceKey")({
  beforeLoad: ({ params }) => {
    if (!VALID.includes(params.serviceKey as ServiceKey)) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const cfg = SERVICES[params.serviceKey as ServiceKey];
    return {
      meta: [
        { title: `${cfg?.title ?? "Service"} — DailyHub` },
        { name: "description", content: cfg?.tagline ?? "DailyHub service" },
        { property: "og:title", content: `${cfg?.title} — DailyHub` },
        { property: "og:description", content: cfg?.tagline ?? "" },
      ],
    };
  },
  component: ServiceDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass rounded-3xl p-10 text-center">
        <div className="text-5xl">🤔</div>
        <p className="mt-3">Unknown service.</p>
        <Link to="/" className="mt-4 inline-block text-primary">
          Back to dashboard →
        </Link>
      </div>
    </div>
  ),
});

function ServiceDetail() {
  const { serviceKey } = Route.useParams();
  const cfg = SERVICES[serviceKey as ServiceKey];
  const [pref, setPref] = useState<Preference>("best");
  const [selected, setSelected] = useState<Provider | null>(null);
  const [providers, setProviders] = useState<Provider[]>(cfg.providers);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProviders(cfg.providers);
    setLive(false);
    fetchProviders(cfg.key).then((res) => {
      if (cancelled) return;
      setProviders(res.providers);
      setLive(res.live);
    });
    return () => {
      cancelled = true;
    };
  }, [cfg]);

  const ranked = useMemo(() => rankProviders(providers, pref), [providers, pref]);

  return (
    <div className="min-h-screen relative">
      <AuroraBackdrop />

      <header className="relative z-20 px-5 sm:px-8 lg:px-12 pt-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl gradient-aurora glow-violet flex items-center justify-center font-bold text-primary-foreground">
            D
          </div>
          <div className="font-display font-semibold text-lg tracking-tight">DailyHub</div>
        </Link>
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Dashboard
        </Link>
      </header>

      <section className="relative z-10 px-5 sm:px-8 lg:px-12 pt-10 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="h-16 w-16 rounded-2xl glass-strong flex items-center justify-center text-4xl animate-float-soft">
            {cfg.emoji}
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {cfg.title}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              {cfg.tagline}
            </p>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <PreferencePicker value={pref} onChange={setPref} />
          <p className="text-sm text-muted-foreground">{PREF_HINTS[pref]}</p>
        </div>
      </section>

      {/* Comparison list */}
      <section className="relative z-10 px-5 sm:px-8 lg:px-12 pb-16">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Compare {ranked.length} providers
            {live && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary normal-case tracking-normal">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Live · Flask API
              </span>
            )}
            {!live && apiEnabled && (
              <span className="text-[10px] text-muted-foreground normal-case tracking-normal">
                (API offline — using mock)
              </span>
            )}
          </h2>
          <span className="text-xs text-muted-foreground">
            Ranked by AI · {pref}
          </span>
        </div>
        <div className="space-y-3">
          {ranked.map((p, i) => (
            <ProviderRow
              key={p.id}
              provider={p}
              index={i}
              unitLabel={cfg.unitLabel}
              onSelect={setSelected}
            />
          ))}
        </div>
      </section>

      <PaymentDialog
        open={!!selected}
        provider={selected}
        unitLabel={cfg.unitLabel}
        serviceKey={cfg.key}
        preference={pref}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
