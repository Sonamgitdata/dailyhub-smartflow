export type ServiceKey = "transport" | "food" | "healthcare" | "home" | "payments";

export interface Provider {
  id: string;
  name: string;
  price: number;
  etaMinutes: number;
  rating: number;
  tag?: string;
  meta?: string;
}

export interface ServiceConfig {
  key: ServiceKey;
  title: string;
  emoji: string;
  tagline: string;
  accent: string; // tailwind class hint
  providers: Provider[];
  ctaLabel: string;
  unitLabel: string; // e.g. "ride", "order"
}

export const SERVICES: Record<ServiceKey, ServiceConfig> = {
  transport: {
    key: "transport",
    title: "Transport",
    emoji: "🚕",
    tagline: "Cabs, autos, bikes — find the smartest ride.",
    accent: "from-aurora-cyan to-aurora-violet",
    ctaLabel: "Book ride",
    unitLabel: "ride",
    providers: [
      { id: "t1", name: "SwiftCab", price: 215, etaMinutes: 4, rating: 4.7, meta: "Sedan • AC" },
      { id: "t2", name: "MetroAuto", price: 128, etaMinutes: 7, rating: 4.4, meta: "Auto • 3 seats" },
      { id: "t3", name: "ZipBike", price: 72, etaMinutes: 3, rating: 4.5, meta: "Bike • Solo" },
      { id: "t4", name: "EcoRide", price: 198, etaMinutes: 6, rating: 4.8, meta: "EV • Quiet" },
    ],
  },
  food: {
    key: "food",
    title: "Food",
    emoji: "🍔",
    tagline: "Hot meals, ranked by what matters to you.",
    accent: "from-aurora-pink to-aurora-violet",
    ctaLabel: "Order food",
    unitLabel: "order",
    providers: [
      { id: "f1", name: "Burger Bay", price: 320, etaMinutes: 28, rating: 4.6, meta: "American • Combo" },
      { id: "f2", name: "Spice Route", price: 280, etaMinutes: 35, rating: 4.7, meta: "Indian • Thali" },
      { id: "f3", name: "Sushi Loop", price: 540, etaMinutes: 42, rating: 4.8, meta: "Japanese • 12 pc" },
      { id: "f4", name: "Greens & Co", price: 240, etaMinutes: 22, rating: 4.5, meta: "Salad • Bowl" },
    ],
  },
  healthcare: {
    key: "healthcare",
    title: "Healthcare",
    emoji: "🏥",
    tagline: "Doctors, labs and pharmacies on demand.",
    accent: "from-aurora-mint to-aurora-cyan",
    ctaLabel: "Book consult",
    unitLabel: "consult",
    providers: [
      { id: "h1", name: "Dr. Mehra (GP)", price: 499, etaMinutes: 15, rating: 4.9, meta: "Video • 20 min" },
      { id: "h2", name: "QuickLab Tests", price: 899, etaMinutes: 90, rating: 4.6, meta: "At-home • CBC" },
      { id: "h3", name: "PillExpress", price: 60, etaMinutes: 25, rating: 4.7, meta: "Pharmacy • Same day" },
      { id: "h4", name: "MindCare Therapy", price: 1200, etaMinutes: 60, rating: 4.8, meta: "Counseling • 50 min" },
    ],
  },
  home: {
    key: "home",
    title: "Home Services",
    emoji: "🛠️",
    tagline: "Cleaning, repair, and handy help in a tap.",
    accent: "from-aurora-violet to-aurora-pink",
    ctaLabel: "Schedule visit",
    unitLabel: "visit",
    providers: [
      { id: "s1", name: "SparkleClean", price: 599, etaMinutes: 120, rating: 4.7, meta: "Deep clean • 2h" },
      { id: "s2", name: "FixIt Pros", price: 349, etaMinutes: 60, rating: 4.5, meta: "Plumber • 1h" },
      { id: "s3", name: "VoltMen", price: 299, etaMinutes: 45, rating: 4.6, meta: "Electrician" },
      { id: "s4", name: "GreenThumb", price: 449, etaMinutes: 90, rating: 4.8, meta: "Gardening" },
    ],
  },
  payments: {
    key: "payments",
    title: "Payments",
    emoji: "💳",
    tagline: "Bills, recharges and transfers in one tap.",
    accent: "from-aurora-mint to-aurora-violet",
    ctaLabel: "Pay now",
    unitLabel: "payment",
    providers: [
      { id: "p1", name: "Electricity Bill", price: 1240, etaMinutes: 1, rating: 5.0, meta: "Due in 3 days" },
      { id: "p2", name: "Mobile Recharge", price: 299, etaMinutes: 1, rating: 5.0, meta: "Unlimited • 28d" },
      { id: "p3", name: "Internet (Fiber)", price: 899, etaMinutes: 1, rating: 5.0, meta: "Auto-pay ready" },
      { id: "p4", name: "Send to Riya", price: 500, etaMinutes: 1, rating: 5.0, meta: "UPI • Instant" },
    ],
  },
};

export const SERVICE_LIST: ServiceKey[] = ["transport", "food", "healthcare", "home", "payments"];

export type Preference = "cheap" | "fast" | "best";

/**
 * Weighted scoring mirroring the Python `Recommend_AI.py` reference:
 *   score = w_rating * rating  -  w_price * price  -  w_time * time
 *
 * Prices and ETAs are normalized to 0..1 across the candidate set so the
 * subtraction stays meaningful regardless of currency or duration scale.
 */
export function calculateScore(
  item: { price: number; etaMinutes: number; rating: number },
  pref: Preference,
  norms: { maxPrice: number; maxEta: number },
): number {
  const weights: Record<Preference, { rating: number; price: number; time: number }> = {
    cheap: { rating: 0.3, price: 0.5, time: 0.2 },
    fast: { rating: 0.3, price: 0.2, time: 0.5 },
    best: { rating: 0.6, price: 0.2, time: 0.2 },
  };
  const w = weights[pref];

  const ratingNorm = item.rating / 5; // 0..1
  const priceNorm = norms.maxPrice ? item.price / norms.maxPrice : 0;
  const timeNorm = norms.maxEta ? item.etaMinutes / norms.maxEta : 0;

  return w.rating * ratingNorm - w.price * priceNorm - w.time * timeNorm;
}

/** AI-style recommendation: scores providers based on user preference. */
export function rankProviders(providers: Provider[], pref: Preference): Provider[] {
  const maxPrice = Math.max(...providers.map((p) => p.price));
  const maxEta = Math.max(...providers.map((p) => p.etaMinutes));

  return [...providers]
    .map((p) => ({ ...p, _score: calculateScore(p, pref, { maxPrice, maxEta }) }))
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...p }, i) => ({
      ...p,
      tag: i === 0 ? "Best Choice" : undefined,
    }));
}

/** Single best pick — mirrors Python `recommend_ai(options, preference)`. */
export function recommendAi(providers: Provider[], pref: Preference): Provider | null {
  const ranked = rankProviders(providers, pref);
  return ranked[0] ?? null;
}
