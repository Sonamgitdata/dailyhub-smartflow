import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { buildProfile, findBestOffer, type UserProfile } from "@/lib/history";
import { SERVICES, type Provider, type ServiceKey } from "@/data/services";

export function BestOfferBanner({
  onPick,
}: {
  onPick: (provider: Provider, serviceKey: ServiceKey) => void;
}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(() => buildProfile(user?.id ?? null));

  useEffect(() => {
    const refresh = () => setProfile(buildProfile(user?.id ?? null));
    refresh();
    window.addEventListener("dailyhub:history-updated", refresh);
    return () => window.removeEventListener("dailyhub:history-updated", refresh);
  }, [user?.id]);

  const offer = findBestOffer(profile);
  if (!offer) return null;

  const cfg = SERVICES[offer.service];
  const isFresh = profile.bookingCount === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl glass-strong p-5 sm:p-6"
    >
      {/* Aurora glow */}
      <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full gradient-aurora opacity-30 blur-3xl" />
      <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-[10px] uppercase tracking-widest font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Best offer for you
          </div>
          <h3 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight">
            {cfg.emoji} {offer.provider.name}
            <span className="text-muted-foreground font-normal text-base"> · {cfg.title}</span>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isFresh ? (
              <>Personalized picks unlock after your first booking — meanwhile this matches our best overall.</>
            ) : (
              <>
                Matches your <span className="text-foreground font-medium">{profile.preferred}</span> preference
                {profile.avgBudget > 0 && (
                  <> · avg budget ₹{profile.avgBudget}</>
                )}
                {profile.topService && (
                  <> · you book {SERVICES[profile.topService].title.toLowerCase()} most</>
                )}
              </>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="px-2.5 py-1 rounded-full glass">₹{offer.provider.price}</span>
            <span className="px-2.5 py-1 rounded-full glass">
              {offer.provider.etaMinutes < 2 ? "Instant" : `${offer.provider.etaMinutes}m`}
            </span>
            <span className="px-2.5 py-1 rounded-full glass">★ {offer.provider.rating}</span>
            {offer.provider.meta && (
              <span className="text-xs text-muted-foreground">{offer.provider.meta}</span>
            )}
          </div>
        </div>

        <button
          onClick={() => onPick(offer.provider, offer.service)}
          className="shrink-0 px-5 py-3 rounded-2xl gradient-aurora text-primary-foreground font-semibold glow-mint hover:scale-[1.03] transition-transform"
        >
          Grab it · ₹{offer.provider.price}
        </button>
      </div>
    </motion.div>
  );
}
