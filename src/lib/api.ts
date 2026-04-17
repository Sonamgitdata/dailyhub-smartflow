/**
 * DailyHub API client.
 *
 * Talks to the Python Flask backend (backend/simulateapi.py) when
 * VITE_DAILYHUB_API is set and reachable. Falls back to local mock data
 * otherwise so the UI always works.
 */

import { SERVICES, type Preference, type Provider, type ServiceKey } from "@/data/services";

const BASE = (import.meta.env.VITE_DAILYHUB_API as string | undefined)?.replace(/\/$/, "") ?? "";

export const apiEnabled = Boolean(BASE);

interface RemoteItem {
  id: number | string;
  name: string;
  price: number;
  time: number;
  rating: number;
}

/** Remote services backed by the Flask API. Others stay on mock data. */
const REMOTE_ENDPOINTS: Partial<Record<ServiceKey, string>> = {
  food: "/food",
  transport: "/transport",
};

async function safeFetch<T>(path: string, init?: RequestInit, timeoutMs = 4000): Promise<T | null> {
  if (!BASE) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function toProvider(item: RemoteItem, prefix: string): Provider {
  return {
    id: `${prefix}-${item.id}`,
    name: item.name,
    // Flask sample is in $; multiply for ₹-style display consistent with mock data.
    price: Math.round(item.price * 80),
    etaMinutes: item.time,
    rating: item.rating,
    meta: "Live · Flask API",
  };
}

/** Fetch providers for a service. Returns remote data if available, else mock. */
export async function fetchProviders(key: ServiceKey): Promise<{ providers: Provider[]; live: boolean }> {
  const endpoint = REMOTE_ENDPOINTS[key];
  if (endpoint) {
    const remote = await safeFetch<RemoteItem[]>(endpoint);
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return { providers: remote.map((r) => toProvider(r, key)), live: true };
    }
  }
  return { providers: SERVICES[key].providers, live: false };
}

/** Ask the Flask API for its recommendation. Falls back to null. */
export async function fetchRecommendation(preference: Preference) {
  return safeFetch<{
    recommended_food: RemoteItem;
    recommended_transport: RemoteItem;
  }>("/recommend", {
    method: "POST",
    body: JSON.stringify({ preference }),
  });
}

/** Simulate a booking through the Flask API. */
export async function bookService(payload: Record<string, unknown>) {
  return safeFetch<{ message: string; order_details: unknown }>("/book", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Simulate a payment through the Flask API. */
export async function payService(amount: number, meta: Record<string, unknown> = {}) {
  return safeFetch<{ message: string; amount: number; status: string }>("/pay", {
    method: "POST",
    body: JSON.stringify({ amount, ...meta }),
  });
}
