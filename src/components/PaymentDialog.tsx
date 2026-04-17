import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Provider } from "@/data/services";
import { apiEnabled, bookService, payService } from "@/lib/api";
import { useAuth, type PaymentMethod } from "@/lib/auth";

type Stage = "confirm" | "processing" | "success" | "insufficient";

function methodLabel(m: PaymentMethod | undefined): string {
  if (!m) return "No method on file";
  if (m.kind === "card") return `${m.brand} •• ${m.last4}`;
  if (m.kind === "upi") return m.handle;
  return `Wallet · ₹${m.balance}`;
}
function methodIcon(m: PaymentMethod | undefined): string {
  if (!m) return "⚠️";
  return m.kind === "card" ? "💳" : m.kind === "upi" ? "🪪" : "👛";
}

export function PaymentDialog({
  open,
  provider,
  unitLabel,
  onClose,
}: {
  open: boolean;
  provider: Provider | null;
  unitLabel: string;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<Stage>("confirm");
  const { user, chargeWallet } = useAuth();
  const method = user?.methods.find((m) => m.id === user.defaultMethodId) ?? user?.methods[0];

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setStage("confirm"), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const [liveNote, setLiveNote] = useState<string | null>(null);

  const pay = async () => {
    if (!provider) return;
    if (method?.kind === "wallet") {
      if (method.balance < provider.price) {
        setStage("insufficient");
        return;
      }
      setStage("processing");
      chargeWallet(provider.price);
      await new Promise((r) => setTimeout(r, 700));
      setLiveNote(`Charged ₹${provider.price} from wallet · new balance ₹${method.balance - provider.price}`);
      setStage("success");
      return;
    }
    setStage("processing");
    setLiveNote(null);
    if (apiEnabled) {
      const booked = await bookService({ provider: provider.name, unit: unitLabel });
      const paid = await payService(provider.price, { provider: provider.name });
      if (booked || paid) {
        setLiveNote(paid?.message ?? booked?.message ?? "Confirmed via Flask API");
      }
    } else {
      await new Promise((r) => setTimeout(r, 1300));
    }
    setLiveNote((prev) => prev ?? `Paid via ${methodLabel(method)}`);
    setStage("success");
  };

  return (
    <AnimatePresence>
      {open && provider && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative glass-strong rounded-3xl p-6 w-full max-w-md"
          >
            {stage === "confirm" && (
              <>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Confirm {unitLabel}
                </div>
                <h3 className="text-2xl font-semibold mt-1">{provider.name}</h3>
                {provider.meta && (
                  <p className="text-sm text-muted-foreground">{provider.meta}</p>
                )}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-[10px] uppercase text-muted-foreground">ETA</div>
                    <div className="font-semibold mt-0.5">
                      {provider.etaMinutes < 2 ? "Instant" : `${provider.etaMinutes}m`}
                    </div>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-[10px] uppercase text-muted-foreground">Rating</div>
                    <div className="font-semibold mt-0.5">★ {provider.rating}</div>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-[10px] uppercase text-muted-foreground">Total</div>
                    <div className="font-semibold mt-0.5">₹{provider.price}</div>
                  </div>
                </div>
                <button
                  onClick={pay}
                  className="mt-6 w-full py-3.5 rounded-2xl gradient-aurora text-primary-foreground font-semibold glow-mint hover:scale-[1.02] transition-transform"
                >
                  Pay ₹{provider.price} • One tap
                </button>
                <button
                  onClick={onClose}
                  className="mt-2 w-full py-2.5 rounded-2xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            {stage === "processing" && (
              <div className="py-10 text-center">
                <motion.div
                  className="mx-auto h-16 w-16 rounded-full border-4 border-white/10 border-t-primary"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                />
                <p className="mt-5 text-sm text-muted-foreground">Securing payment…</p>
              </div>
            )}
            {stage === "success" && (
              <div className="py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="mx-auto h-20 w-20 rounded-full gradient-aurora flex items-center justify-center text-3xl glow-mint"
                >
                  ✓
                </motion.div>
                <h4 className="mt-5 text-xl font-semibold">Payment successful</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {provider.name} • ₹{provider.price}
                </p>
                {liveNote && (
                  <p className="mt-2 text-xs text-primary">{liveNote}</p>
                )}
                <button
                  onClick={onClose}
                  className="mt-6 w-full py-3 rounded-2xl glass-strong font-medium hover:bg-white/10 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
