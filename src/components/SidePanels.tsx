"use client";

import { useMarketFeed, type Quote } from "@/lib/useMarketFeed";
import {
  hexId,
  flickRate,
  dirClass,
  barFill,
  barString,
  syncPct,
  aggregatePattern,
} from "@/lib/marketViz";

// Ambient fallback blocks (offline / no key), mirroring the ticker's spirit.
const FALLBACK_BLOCKS = [
  { id: "0x7F3A", sym: "MAGI-01", sync: "98.7", bar: "███▒░░░░░░", dir: "up" as const, rate: 1.8 },
  { id: "0x0A21", sym: "A.T.FLD", sync: "97.2", bar: "██████░░░░", dir: "up" as const, rate: 1.2 },
  { id: "0x3C09", sym: "第3", sync: "95.5", bar: "████░░░░░░", dir: "down" as const, rate: 1.5 },
];

function Block({
  id,
  sym,
  sync,
  bar,
  dir,
  rate,
}: {
  id: string;
  sym: string;
  sync: string;
  bar: string;
  dir: "up" | "down";
  rate: number;
}) {
  return (
    <div
      className={`hud-panel-block hud-panel-block--${dir}`}
      style={{ ["--flick-rate" as string]: `${rate}s` }}
    >
      <span className="hud-panel-id">{id}</span>
      <span className="hud-panel-sym">{sym}</span>
      <span className="hud-panel-sync">SYNC {sync}%</span>
      <span className="hud-panel-bar">{bar}</span>
    </div>
  );
}

function blocksFor(quotes: Quote[]): Array<React.ComponentProps<typeof Block>> {
  return quotes.map((q) => ({
    id: hexId(q),
    sym: q.sym,
    sync: syncPct(q),
    bar: barString(barFill(q.dp)),
    dir: dirClass(q.dp),
    rate: flickRate(q.dp),
  }));
}

export default function SidePanels() {
  const { quotes, status } = useMarketFeed();
  const live = status === "live" && quotes.length > 0;

  const agg = aggregatePattern(quotes);

  const allBlocks = live ? blocksFor(quotes) : FALLBACK_BLOCKS;
  const left = allBlocks.filter((_, i) => i % 2 === 0);
  const right = allBlocks.filter((_, i) => i % 2 === 1);

  const patternDir = live ? agg.dir : "up";

  return (
    <>
      <aside className="hud-panel hud-panel--left" aria-hidden="true">
        <div className="hud-panel-head">MAGI · LEFT</div>
        {left.map((b, i) => (
          <Block key={`l-${b.sym}-${i}`} {...b} />
        ))}
      </aside>
      <aside className="hud-panel hud-panel--right" aria-hidden="true">
        <div className="hud-panel-head">MAGI · RIGHT</div>
        {right.map((b, i) => (
          <Block key={`r-${b.sym}-${i}`} {...b} />
        ))}
        <div className={`hud-panel-pattern hud-panel-block--${patternDir}`}>
          PATTERN
          <strong>{live ? agg.pattern : "ORANGE"}</strong>
        </div>
      </aside>
    </>
  );
}
