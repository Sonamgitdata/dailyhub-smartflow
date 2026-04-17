import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth, type PaymentMethod } from "@/lib/auth";

function methodLabel(m: PaymentMethod): string {
  if (m.kind === "card") return `${m.brand} •• ${m.last4}`;
  if (m.kind === "upi") return m.handle;
  return `Wallet · ₹${m.balance}`;
}
function methodIcon(m: PaymentMethod): string {
  return m.kind === "card" ? "💳" : m.kind === "upi" ? "🪪" : "👛";
}

export function AccountMenu() {
  const { user, signOut, setDefaultMethod, topUpWallet } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const wallet = user.methods.find((m) => m.kind === "wallet");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass hover:bg-white/10 transition-colors"
      >
        <span className="h-7 w-7 rounded-full gradient-aurora flex items-center justify-center text-[11px] font-bold text-primary-foreground">
          {initials}
        </span>
        <span className="text-xs font-medium hidden sm:block">{user.name.split(" ")[0]}</span>
        {wallet && (
          <span className="text-[11px] text-muted-foreground hidden md:block">
            ₹{wallet.balance}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 glass-strong rounded-2xl p-4 z-40"
            >
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>

              <div className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                Payment methods
              </div>
              <div className="mt-2 space-y-1.5">
                {user.methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setDefaultMethod(m.id)}
                    className={`w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-colors ${
                      user.defaultMethodId === m.id
                        ? "glass border border-primary/40"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <span>{methodIcon(m)}</span>
                    <span className="flex-1">{methodLabel(m)}</span>
                    {user.defaultMethodId === m.id && (
                      <span className="text-[9px] uppercase tracking-wider text-primary">Default</span>
                    )}
                  </button>
                ))}
              </div>

              {wallet && (
                <button
                  onClick={() => topUpWallet(500)}
                  className="mt-3 w-full py-2 rounded-xl text-xs glass hover:bg-white/10 transition-colors"
                >
                  + Top up wallet ₹500
                </button>
              )}

              <button
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
                className="mt-3 w-full py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
