"use client";

import { useEffect, useState } from "react";

// Free Finnhub key, injected at build time. Without it (or on any fetch
// failure) the ticker falls back to flavor readouts so it never looks broken.
const KEY = process.env.NEXT_PUBLIC_FINNHUB_KEY;

const SYMBOLS = ["LMT", "PLTR", "RTX", "NOC", "GD", "BA", "BAH", "HII"];

const POLL_MS = 45_000;

// Shown when there's no key / the feed is unreachable.
const FALLBACK = [
  "MARKET FEED // STANDBY",
  "MAGI CONSENSUS : 3 / 3",
  "A.T. FIELD : NEUTRAL",
  "PATTERN : ORANGE",
  "LCL PRESSURE : NOMINAL",
  "第3新東京市 : ALL CLEAR",
];

interface Quote {
  sym: string;
  price: number;
  dp: number; // percent change
}

type Status = "connecting" | "live" | "offline";

export default function StockTicker() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [status, setStatus] = useState<Status>("connecting");

  useEffect(() => {
    if (!KEY) {
      setStatus("offline");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const settled = await Promise.all(
          SYMBOLS.map(async (sym) => {
            const res = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${KEY}`,
            );
            if (!res.ok) return null;
            const j = await res.json();
            if (typeof j.c !== "number" || j.c === 0) return null;
            return { sym, price: j.c, dp: typeof j.dp === "number" ? j.dp : 0 };
          }).map((p) => p.catch(() => null)),
        );

        if (cancelled) return;
        const ok = settled.filter((q): q is Quote => q !== null);
        if (ok.length) {
          setQuotes(ok);
          setStatus("live");
        } else {
          setStatus("offline");
        }
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const live = status === "live" && quotes.length > 0;

  // Build the marquee content, duplicated for a seamless loop.
  const items = live
    ? quotes.map((q) => {
        const up = q.dp >= 0;
        return (
          <span key={q.sym} className="hud-ticker-item">
            <span className="hud-ticker-mark">◢</span>
            <span className="tk-sym">{q.sym}</span>
            <span className="tk-price">{q.price.toFixed(2)}</span>
            <span className={`tk-chg${up ? " tk-up" : " tk-down"}`}>
              {up ? "▲" : "▼"}
              {Math.abs(q.dp).toFixed(2)}%
            </span>
          </span>
        );
      })
    : FALLBACK.map((t, i) => (
        <span key={i} className="hud-ticker-item">
          <span className="hud-ticker-mark">◢</span> {t}
        </span>
      ));

  const tag =
    status === "live"
      ? "● MARKET LIVE"
      : status === "connecting"
        ? "◌ LINKING…"
        : "◌ FEED STANDBY";

  return (
    <div className="hud-ticker" aria-hidden="true">
      <span className={`hud-ticker-tag hud-ticker-tag--${status}`}>{tag}</span>
      <div className="hud-ticker-window">
        <div className="hud-ticker-track">
          {items}
          {items}
        </div>
      </div>
    </div>
  );
}
