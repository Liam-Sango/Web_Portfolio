"use client";

import { useMarketFeed } from "@/lib/useMarketFeed";

// Shown when there's no key / the feed is unreachable.
const FALLBACK = [
  "MARKET FEED // STANDBY",
  "MAGI CONSENSUS : 3 / 3",
  "A.T. FIELD : NEUTRAL",
  "PATTERN : ORANGE",
  "LCL PRESSURE : NOMINAL",
  "第3新東京市 : ALL CLEAR",
];

export default function StockTicker() {
  const { quotes, status } = useMarketFeed();

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
