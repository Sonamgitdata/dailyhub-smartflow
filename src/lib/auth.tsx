/**
 * DailyHub demo auth + payment vault.
 *
 * Mock-only. Stores everything in localStorage so the prototype feels real
 * without a backend. Card numbers/CVVs are masked before persistence —
 * never use this for real payments.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type PaymentMethodKind = "card" | "upi" | "wallet";

export interface CardMethod {
  kind: "card";
  id: string;
  brand: string; // Visa / Mastercard / RuPay (guessed from prefix)
  last4: string;
  expiry: string; // MM/YY
  holder: string;
}
export interface UpiMethod {
  kind: "upi";
  id: string;
  handle: string;
}
export interface WalletMethod {
  kind: "wallet";
  id: string;
  balance: number;
}
export type PaymentMethod = CardMethod | UpiMethod | WalletMethod;

export interface DailyUser {
  id: string;
  name: string;
  email: string;
  createdAt: number;
  methods: PaymentMethod[];
  defaultMethodId: string | null;
}

interface AuthState {
  user: DailyUser | null;
  ready: boolean;
  signIn: (input: { name: string; email: string }) => DailyUser;
  signOut: () => void;
  addMethods: (methods: PaymentMethod[], defaultId?: string) => void;
  setDefaultMethod: (id: string) => void;
  topUpWallet: (amount: number) => void;
  chargeWallet: (amount: number) => boolean;
}

const KEY = "dailyhub.user.v1";
const AuthContext = createContext<AuthState | null>(null);

function detectBrand(num: string): string {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^(60|65|81|82)/.test(n)) return "RuPay";
  if (/^3[47]/.test(n)) return "Amex";
  return "Card";
}

export function maskCard(raw: string): { last4: string; brand: string } {
  const digits = raw.replace(/\D/g, "");
  return { last4: digits.slice(-4).padStart(4, "•"), brand: detectBrand(digits) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DailyUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setUser(JSON.parse(raw) as DailyUser);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = (next: DailyUser | null) => {
    setUser(next);
    if (typeof window === "undefined") return;
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  };

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      signIn: ({ name, email }) => {
        const fresh: DailyUser = {
          id: `u-${Date.now().toString(36)}`,
          name: name.trim() || "Guest",
          email: email.trim().toLowerCase(),
          createdAt: Date.now(),
          methods: [],
          defaultMethodId: null,
        };
        persist(fresh);
        return fresh;
      },
      signOut: () => persist(null),
      addMethods: (methods, defaultId) => {
        if (!user) return;
        const merged = [...user.methods, ...methods];
        persist({
          ...user,
          methods: merged,
          defaultMethodId: defaultId ?? user.defaultMethodId ?? methods[0]?.id ?? null,
        });
      },
      setDefaultMethod: (id) => {
        if (!user) return;
        persist({ ...user, defaultMethodId: id });
      },
      topUpWallet: (amount) => {
        if (!user) return;
        const methods = user.methods.map((m) =>
          m.kind === "wallet" ? { ...m, balance: m.balance + amount } : m,
        );
        persist({ ...user, methods });
      },
      chargeWallet: (amount) => {
        if (!user) return false;
        const wallet = user.methods.find((m): m is WalletMethod => m.kind === "wallet");
        if (!wallet || wallet.balance < amount) return false;
        const methods = user.methods.map((m) =>
          m.kind === "wallet" ? { ...m, balance: m.balance - amount } : m,
        );
        persist({ ...user, methods });
        return true;
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
