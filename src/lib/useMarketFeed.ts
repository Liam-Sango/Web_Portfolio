"use client";

import { useEffect, useState } from "react";

// Free Finnhub key, injected at build time. Without it (or on any fetch
// failure) consumers fall back to flavor readouts so nothing looks broken.
const KEY = process.env.NEXT_PUBLIC_FINNHUB_KEY;

export const SYMBOLS = ["LMT", "PLTR", "RTX", "NOC", "GD", "BA", "BAH", "HII"];

const POLL_MS = 45_000;

export interface Quote {
  sym: string;
  price: number;
  dp: number; // percent change
}

export type Status = "connecting" | "live" | "offline";

export interface Feed {
  quotes: Quote[];
  status: Status;
}

// --- module-level singleton: poll once, fan out to all subscribers ---
let state: Feed = { quotes: [], status: KEY ? "connecting" : "offline" };
const subscribers = new Set<(f: Feed) => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;
let inFlight = false;

function emit() {
  for (const cb of subscribers) cb(state);
}

async function load() {
  if (inFlight || !KEY) return;
  inFlight = true;
  try {
    const settled = await Promise.all(
      SYMBOLS.map((sym) =>
        fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${KEY}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((j) => {
            if (!j || typeof j.c !== "number" || j.c === 0) return null;
            return {
              sym,
              price: j.c,
              dp: typeof j.dp === "number" ? j.dp : 0,
            } as Quote;
          })
          .catch(() => null),
      ),
    );
    const ok = settled.filter((q): q is Quote => q !== null);
    state = ok.length
      ? { quotes: ok, status: "live" }
      : { quotes: state.quotes, status: "offline" };
  } catch {
    state = { quotes: state.quotes, status: "offline" };
  } finally {
    inFlight = false;
    emit();
  }
}

function start() {
  if (intervalId !== null || !KEY) return;
  load();
  intervalId = setInterval(load, POLL_MS);
}

function stop() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function useMarketFeed(): Feed {
  const [feed, setFeed] = useState<Feed>(state);

  useEffect(() => {
    subscribers.add(setFeed);
    setFeed(state); // sync any state that arrived before mount
    start();
    return () => {
      subscribers.delete(setFeed);
      if (subscribers.size === 0) stop();
    };
  }, []);

  return feed;
}
