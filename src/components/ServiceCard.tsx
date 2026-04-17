import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { ServiceConfig } from "@/data/services";

export function ServiceCard({
  service,
  index,
}: {
  service: ServiceConfig;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/service/$serviceKey"
        params={{ serviceKey: service.key }}
        className="block float-3d glass rounded-3xl p-6 relative overflow-hidden group h-full"
      >
        <div
          className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${service.accent} opacity-30 blur-2xl group-hover:opacity-50 transition-opacity`}
        />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between">
            <div className="text-5xl animate-float-soft" style={{ animationDelay: `${index * 0.3}s` }}>
              {service.emoji}
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
              {service.providers.length} options
            </span>
          </div>
          <h3 className="mt-5 text-xl font-semibold tracking-tight">{service.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{service.tagline}</p>
          <div className="mt-5 flex items-center gap-2 text-sm text-primary group-hover:gap-3 transition-all">
            <span>Open</span>
            <span>→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
