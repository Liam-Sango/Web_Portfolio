"use client";

import { useEffect, useState } from "react";
import StockTicker from "@/components/StockTicker";
import SidePanels from "@/components/SidePanels";

function clock(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export default function Hud() {
  const [time, setTime] = useState<string | null>(null);
  const [sync, setSync] = useState(99.9);

  useEffect(() => {
    setTime(clock(new Date()));
    const t = setInterval(() => setTime(clock(new Date())), 1000);
    // gentle "harmonics" jitter on the sync ratio readout
    const j = setInterval(() => {
      setSync(98.4 + Math.random() * 1.6);
    }, 900);
    return () => {
      clearInterval(t);
      clearInterval(j);
    };
  }, []);

  return (
    <div className="hud" aria-hidden="true">
      {/* viewport corner reticles */}
      <span className="hud-corner hud-corner--tl" />
      <span className="hud-corner hud-corner--tr" />
      <span className="hud-corner hud-corner--bl" />
      <span className="hud-corner hud-corner--br" />

      {/* top-right telemetry */}
      <div className="hud-telemetry">
        <span className="hud-rec">
          <span className="hud-rec-dot" /> REC
        </span>
        <span className="hud-clock">{time ?? "--:--:--"}</span>
        <span className="hud-sync">
          SYNC <strong>{sync.toFixed(1)}%</strong>
        </span>
      </div>

      {/* vertical side labels */}
      <div className="hud-side hud-side--left jp">特務機関ネルフ</div>
      <div className="hud-side hud-side--right">CODE : 601 — MAGI</div>

      {/* stock-driven MAGI readouts in the gutters */}
      <SidePanels />

      {/* bottom market-data ticker (live Finnhub feed) */}
      <StockTicker />
    </div>
  );
}
