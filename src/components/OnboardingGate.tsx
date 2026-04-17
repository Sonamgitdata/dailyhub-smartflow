import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AuroraBackdrop } from "@/components/AuroraBackdrop";
import {
  maskCard,
  useAuth,
  type PaymentMethod,
} from "@/lib/auth";

type Step = "account" | "payment" | "done";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { user, ready, signIn, addMethods } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-primary animate-spin" />
      </div>
    );
  }

  // Existing user with at least one method → straight to app.
  if (user && user.methods.length > 0) return <>{children}</>;

  return <OnboardingFlow startAt={user ? "payment" : "account"} onDone={() => undefined}>{children}</OnboardingFlow>;
}

function OnboardingFlow({
  startAt,
  children,
}: {
  startAt: Step;
  onDone: () => void;
  children: React.ReactNode;
}) {
  const { signIn, addMethods, user } = useAuth();
  const [step, setStep] = useState<Step>(startAt);

  // Account
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailErr, setEmailErr] = useState("");

  // Payment
  const [tab, setTab] = useState<"card" | "upi" | "wallet">("card");
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upi, setUpi] = useState("");
  const [topup, setTopup] = useState(500);
  const [payErr, setPayErr] = useState("");

  const submitAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr("Enter a valid email");
      return;
    }
    if (name.trim().length < 2) {
      setEmailErr("Name must be at least 2 characters");
      return;
    }
    signIn({ name, email });
    setStep("payment");
  };

  const buildMethods = (): PaymentMethod[] | string => {
    const methods: PaymentMethod[] = [];
    if (tab === "card") {
      const digits = cardNum.replace(/\D/g, "");
      if (digits.length < 13 || digits.length > 19) return "Card number looks wrong";
      if (!/^\d{2}\/\d{2}$/.test(cardExp)) return "Expiry must be MM/YY";
      if (!/^\d{3,4}$/.test(cardCvv)) return "CVV must be 3 or 4 digits";
      if (cardName.trim().length < 2) return "Add the cardholder name";
      const { last4, brand } = maskCard(digits);
      methods.push({
        kind: "card",
        id: `c-${Date.now().toString(36)}`,
        brand,
        last4,
        expiry: cardExp,
        holder: cardName.trim(),
      });
    } else if (tab === "upi") {
      if (!/^[\w.\-]{2,}@[\w.\-]{2,}$/.test(upi)) return "Enter a valid UPI ID (name@bank)";
      methods.push({ kind: "upi", id: `u-${Date.now().toString(36)}`, handle: upi.trim() });
    } else {
      if (topup < 100) return "Minimum top-up is ₹100";
      methods.push({ kind: "wallet", id: `w-${Date.now().toString(36)}`, balance: topup });
    }
    return methods;
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPayErr("");
    const built = buildMethods();
    if (typeof built === "string") {
      setPayErr(built);
      return;
    }
    addMethods(built, built[0].id);
    setStep("done");
    setTimeout(() => {
      // Smooth handoff into the app
    }, 900);
  };

  if (step === "done") return <>{children}</>;

  return (
    <div className="min-h-screen relative">
      <AuroraBackdrop />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-strong rounded-3xl p-7 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full gradient-aurora opacity-25 blur-2xl" />
          <div className="flex items-center gap-2.5 mb-6">
            <div className="h-9 w-9 rounded-xl gradient-aurora glow-violet flex items-center justify-center font-bold text-primary-foreground">
              D
            </div>
            <div>
              <div className="font-display font-semibold text-lg leading-none tracking-tight">DailyHub</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Step {step === "account" ? "1" : "2"} of 2 · {step === "account" ? "Create account" : "Payment setup"}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "account" && (
              <motion.form
                key="account"
                onSubmit={submitAccount}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-2xl font-bold leading-tight">Welcome to DailyHub.</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    One account for transport, food, healthcare, home & payments.
                  </p>
                </div>
                <Field label="Full name">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aanya Sharma"
                    className="w-full bg-transparent outline-none text-sm py-2.5 px-3 rounded-xl glass border border-white/5 focus:border-primary/50 transition-colors"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent outline-none text-sm py-2.5 px-3 rounded-xl glass border border-white/5 focus:border-primary/50 transition-colors"
                  />
                </Field>
                {emailErr && <p className="text-xs text-destructive">{emailErr}</p>}
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl gradient-aurora text-primary-foreground font-semibold glow-mint hover:scale-[1.01] transition-transform"
                >
                  Continue
                </button>
                <p className="text-[11px] text-muted-foreground text-center">
                  Demo mode · No real account is created.
                </p>
              </motion.form>
            )}

            {step === "payment" && (
              <motion.form
                key="payment"
                onSubmit={submitPayment}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold leading-tight">Add a payment method.</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Required to book rides, order food, or schedule services. You can add more later.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1 glass rounded-2xl">
                  {(["card", "upi", "wallet"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                        tab === t
                          ? "gradient-aurora text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "card" ? "💳 Card" : t === "upi" ? "🪪 UPI" : "👛 Wallet"}
                    </button>
                  ))}
                </div>

                {tab === "card" && (
                  <div className="space-y-3">
                    <Field label="Card number">
                      <input
                        inputMode="numeric"
                        value={cardNum}
                        onChange={(e) => setCardNum(formatCard(e.target.value))}
                        placeholder="4242 4242 4242 4242"
                        maxLength={23}
                        className="w-full bg-transparent outline-none text-sm tracking-wider py-2.5 px-3 rounded-xl glass border border-white/5 focus:border-primary/50"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry">
                        <input
                          value={cardExp}
                          onChange={(e) => setCardExp(formatExpiry(e.target.value))}
                          placeholder="12/27"
                          maxLength={5}
                          className="w-full bg-transparent outline-none text-sm py-2.5 px-3 rounded-xl glass border border-white/5 focus:border-primary/50"
                        />
                      </Field>
                      <Field label="CVV">
                        <input
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="123"
                          className="w-full bg-transparent outline-none text-sm py-2.5 px-3 rounded-xl glass border border-white/5 focus:border-primary/50"
                        />
                      </Field>
                    </div>
                    <Field label="Cardholder">
                      <input
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="AANYA SHARMA"
                        className="w-full bg-transparent outline-none text-sm py-2.5 px-3 rounded-xl glass border border-white/5 focus:border-primary/50 uppercase"
                      />
                    </Field>
                  </div>
                )}

                {tab === "upi" && (
                  <div className="space-y-3">
                    <Field label="UPI ID">
                      <input
                        value={upi}
                        onChange={(e) => setUpi(e.target.value)}
                        placeholder="aanya@okhdfc"
                        className="w-full bg-transparent outline-none text-sm py-2.5 px-3 rounded-xl glass border border-white/5 focus:border-primary/50"
                      />
                    </Field>
                    <p className="text-[11px] text-muted-foreground">
                      Works with any UPI app — Google Pay, PhonePe, Paytm, BHIM.
                    </p>
                  </div>
                )}

                {tab === "wallet" && (
                  <div className="space-y-3">
                    <Field label="Top-up amount (₹)">
                      <input
                        type="number"
                        min={100}
                        step={100}
                        value={topup}
                        onChange={(e) => setTopup(Number(e.target.value))}
                        className="w-full bg-transparent outline-none text-sm py-2.5 px-3 rounded-xl glass border border-white/5 focus:border-primary/50"
                      />
                    </Field>
                    <div className="grid grid-cols-4 gap-2">
                      {[200, 500, 1000, 2000].map((v) => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => setTopup(v)}
                          className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            topup === v
                              ? "gradient-aurora text-primary-foreground"
                              : "glass text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          ₹{v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {payErr && <p className="text-xs text-destructive">{payErr}</p>}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl gradient-aurora text-primary-foreground font-semibold glow-mint hover:scale-[1.01] transition-transform"
                >
                  Save & enter DailyHub
                </button>
                <p className="text-[11px] text-muted-foreground text-center">
                  🔒 Demo only · stored locally on this device, never transmitted.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function formatCard(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 19);
  return d.replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}
