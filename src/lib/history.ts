/**
 * DailyHub user history + profile.
 *
 * Tracks every paid booking in localStorage so we can build a `user_profile`
 * like the Python prototype:
 *
 *   user_profile = { "preferred": "cheap", "avg_budget": 4 }
 *
 * The profile is derived from history (most-used preference, mean spend).
 * Used to power the "Best offer for you" personalized banner.
 */
import { rankProviders, SERVICES, type Preference, type Provider, type ServiceKey } from "@/data/services";

export interface HistoryEntry {
  id: string;
  userId: string;
  serviceKey: ServiceKey | "combo";
  providerName: string;
  price: number;
  preference: Preference;
  at: number;
}

export interface UserProfile {
  preferred: Preference;
  avgBudget: number;
  bookingCount: number;
  topService: ServiceKey | null;
}

const KEY = "dailyhub.history.v1";

function readAll(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function logBooking(entry: Omit<HistoryEntry, "id" | "at">): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: `h-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
  };
  const all = readAll();
  all.unshift(full);
  // Cap history to last 50 entries to keep localStorage tidy.
  writeAll(all.slice(0, 50));
  window.dispatchEvent(new CustomEvent("dailyhub:history-updated"));
  return full;
}

export function getHistory(userId: string | null): HistoryEntry[] {
  if (!userId) return [];
  return readAll().filter((e) => e.userId === userId);
}

export function buildProfile(userId: string | null): UserProfile {
  const entries = getHistory(userId);
  if (entries.length === 0) {
    return { preferred: "best", avgBudget: 0, bookingCount: 0, topService: null };
  }

  // Most-used preference
  const prefCount: Record<Preference, number> = { cheap: 0, fast: 0, best: 0 };
  for (const e of entries) prefCount[e.preference]++;
  const preferred = (Object.entries(prefCount).sort((a, b) => b[1] - a[1])[0][0]) as Preference;

  // Average budget across paid bookings
  const avgBudget = Math.round(entries.reduce((s, e) => s + e.price, 0) / entries.length);

  // Top service category
  const svcCount: Partial<Record<ServiceKey | "combo", number>> = {};
  for (const e of entries) svcCount[e.serviceKey] = (svcCount[e.serviceKey] ?? 0) + 1;
  const topService = (Object.entries(svcCount).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] ??
    null) as ServiceKey | null;

  return { preferred, avgBudget, bookingCount: entries.length, topService };
}

/**
 * Pick the single best offer across all services for this user, biased by
 * their preferred mode and average budget. Items at or under the user's
 * avg_budget get a small boost so we surface "fits your wallet" deals.
 */
export function findBestOffer(profile: UserProfile): { service: ServiceKey; provider: Provider } | null {
  const candidates: { service: ServiceKey; provider: Provider; boost: number }[] = [];

  (Object.keys(SERVICES) as ServiceKey[]).forEach((key) => {
    const ranked = rankProviders(SERVICES[key].providers, profile.preferred);
    const best = ranked[0];
    if (!best) return;
    // Within-budget bonus (Python `avg_budget` analogue, scaled to ₹).
    const budgetCeiling = profile.avgBudget > 0 ? profile.avgBudget * 1.1 : Infinity;
    const boost = best.price <= budgetCeiling ? 0.15 : 0;
    candidates.push({ service: key, provider: best, boost });
  });

  if (candidates.length === 0) return null;

  // Score = rating/5 - normalized price + boost
  const maxPrice = Math.max(...candidates.map((c) => c.provider.price));
  candidates.sort((a, b) => {
    const sa = a.provider.rating / 5 - a.provider.price / maxPrice + a.boost;
    const sb = b.provider.rating / 5 - b.provider.price / maxPrice + b.boost;
    return sb - sa;
  });

  return { service: candidates[0].service, provider: candidates[0].provider };
}
