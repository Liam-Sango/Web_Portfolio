# NERV Stock-Driven Side Panels — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the empty left/right gutters with NERV-style abstract MAGI readout panels whose flicker and color are driven by the live Finnhub market feed, sharing a single poller with the existing ticker.

**Architecture:** Extract the Finnhub polling into a module-level singleton behind a `useMarketFeed()` hook so the feed is fetched once regardless of subscriber count. Refactor `StockTicker` onto it, then add a decorative `SidePanels` component (mounted in the HUD overlay) that maps quotes to flicker rate, color, and bar fill via small pure helpers. Style + auto-hide + reduced-motion handled in `globals.css`.

**Tech Stack:** Next.js 15 (static export), React 19, TypeScript (strict), plain CSS. No test framework exists in this repo; verification is `npx tsc --noEmit` typecheck + `npm run build` + a visual checklist.

---

## File Structure

- **Create** `src/lib/useMarketFeed.ts` — singleton poller + `useMarketFeed()` hook; owns `Quote`, `Status`, `SYMBOLS`.
- **Create** `src/lib/marketViz.ts` — pure helpers mapping quotes → visual values (hex id, flicker rate, direction class, bar fill, aggregate pattern). No React, no side effects.
- **Create** `src/components/SidePanels.tsx` — renders left/right MAGI panels from `useMarketFeed()` + `marketViz` helpers.
- **Modify** `src/components/StockTicker.tsx` — drop inline polling, consume `useMarketFeed()`. Visuals unchanged.
- **Modify** `src/components/Hud.tsx` — mount `<SidePanels />`.
- **Modify** `src/app/globals.css` — `.hud-panel` styles, flicker keyframes, auto-hide + reduced-motion media queries.

---

## Task 1: Extract shared market-feed hook

**Files:**
- Create: `src/lib/useMarketFeed.ts`
- Modify: `src/components/StockTicker.tsx`

- [ ] **Step 1: Create the singleton feed module + hook**

Create `src/lib/useMarketFeed.ts`:

```ts
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
```

- [ ] **Step 2: Refactor `StockTicker` onto the hook**

Replace the top of `src/components/StockTicker.tsx` (the `KEY`, `SYMBOLS`,
`POLL_MS`, `Quote`, `Status` declarations and the entire `useEffect`/`useState`
polling block) so it consumes the shared hook. Keep `FALLBACK` and all
rendering logic exactly as-is.

New file contents:

```tsx
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
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds (static export, ticker still renders).

- [ ] **Step 5: Commit**

```bash
git add src/lib/useMarketFeed.ts src/components/StockTicker.tsx
git commit -m "Extract shared useMarketFeed hook; refactor ticker onto it"
```

---

## Task 2: Pure visual-mapping helpers

**Files:**
- Create: `src/lib/marketViz.ts`

- [ ] **Step 1: Write the helpers**

Create `src/lib/marketViz.ts`. These are pure (deterministic, no `Math.random`,
no `Date`) so render output is stable and SSR/export-safe.

```ts
import type { Quote } from "@/lib/useMarketFeed";

// Deterministic 4-digit hex id from a symbol's price (no randomness, so
// static export and client render agree). e.g. 467.20 -> "0x46720" trimmed.
export function hexId(q: Quote): string {
  const n = Math.round(q.price * 100) % 0x10000;
  return "0x" + n.toString(16).toUpperCase().padStart(4, "0");
}

// Flicker animation-duration in seconds: bigger |dp| = faster flicker.
// Clamped so calm stocks pulse slowly and wild ones stutter, never frozen.
export function flickRate(dp: number): number {
  const mag = Math.min(Math.abs(dp), 5); // cap at 5%
  // 0% -> 2.4s (slow pulse), 5% -> 0.18s (rapid stutter)
  return +(2.4 - (mag / 5) * 2.22).toFixed(2);
}

// Direction class for color (green up / amber-red down).
export function dirClass(dp: number): "up" | "down" {
  return dp >= 0 ? "up" : "down";
}

// Bar fill 0..10 cells from |dp| (each ~0.5% = one cell, capped).
export function barFill(dp: number): number {
  return Math.max(1, Math.min(10, Math.round(Math.abs(dp) * 2)));
}

// Render a 10-cell block bar string from a fill count.
export function barString(fill: number): string {
  const f = Math.max(0, Math.min(10, fill));
  return "█".repeat(f) + "░".repeat(10 - f);
}

// Synthetic SYNC% readout derived from price+dp (deterministic, 90.0–99.9).
export function syncPct(q: Quote): string {
  const base = (Math.abs(q.price) + Math.abs(q.dp) * 7) % 10; // 0..10
  return (90 + base).toFixed(1);
}

// Aggregate PATTERN code from mean dp across quotes.
// Net up -> BLUE (all clear), flat -> GREEN, net down -> ORANGE/RED.
export function aggregatePattern(quotes: Quote[]): {
  pattern: string;
  dir: "up" | "down";
  meanDp: number;
} {
  if (quotes.length === 0)
    return { pattern: "ORANGE", dir: "down", meanDp: 0 };
  const meanDp =
    quotes.reduce((s, q) => s + q.dp, 0) / quotes.length;
  const pattern =
    meanDp > 0.4 ? "BLUE" : meanDp >= -0.4 ? "GREEN" : meanDp < -1.5 ? "RED" : "ORANGE";
  return { pattern, dir: meanDp >= 0 ? "up" : "down", meanDp };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/marketViz.ts
git commit -m "Add pure market-visualization helpers for side panels"
```

---

## Task 3: SidePanels component

**Files:**
- Create: `src/components/SidePanels.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/SidePanels.tsx`. It splits symbols between the two panels
(even-index → left, odd-index → right) so each gutter shows different blocks.
Offline → ambient flavor blocks.

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/SidePanels.tsx
git commit -m "Add SidePanels MAGI readout component"
```

---

## Task 4: Styles, flicker, auto-hide, reduced-motion

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Append panel styles**

Append to the end of `src/app/globals.css`:

```css
/* ── NERV side panels (stock-driven MAGI readouts) ───────────────── */
.hud-panel {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 96px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dim);
  opacity: 0.7;
}

/* sit inside the gutter, clear of the thin .hud-side vertical labels */
.hud-panel--left {
  left: 22px;
  align-items: flex-start;
  text-align: left;
}
.hud-panel--right {
  right: 22px;
  align-items: flex-end;
  text-align: right;
}

.hud-panel-head {
  font-size: 0.5rem;
  letter-spacing: 0.2em;
  color: var(--accent-dim);
  border-bottom: 1px solid var(--line-soft);
  padding-bottom: 3px;
  width: 100%;
}

.hud-panel-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 4px 0;
  /* fall back to a calm rate if the inline var is missing */
  --flick-rate: 1.8s;
  animation: hudFlick var(--flick-rate) steps(2, end) infinite;
}

.hud-panel-id {
  color: var(--accent);
  font-size: 0.58rem;
}
.hud-panel-sym {
  color: var(--text);
  font-weight: 600;
}
.hud-panel-sync {
  font-size: 0.5rem;
}
.hud-panel-bar {
  letter-spacing: -0.05em;
  font-size: 0.62rem;
}

.hud-panel-block--up .hud-panel-id,
.hud-panel-block--up .hud-panel-bar {
  color: var(--accent);
  text-shadow: 0 0 6px var(--accent-glow);
}
.hud-panel-block--down .hud-panel-id,
.hud-panel-block--down .hud-panel-bar {
  color: var(--amber, #ffb347);
  text-shadow: 0 0 6px rgba(255, 80, 40, 0.5);
}

.hud-panel-pattern {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.5rem;
  letter-spacing: 0.16em;
}
.hud-panel-pattern strong {
  font-family: var(--font-display);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
}
.hud-panel-pattern.hud-panel-block--up strong {
  color: var(--accent);
}
.hud-panel-pattern.hud-panel-block--down strong {
  color: var(--amber, #ffb347);
}

@keyframes hudFlick {
  0%,
  100% {
    opacity: 1;
  }
  45% {
    opacity: 0.62;
  }
  46% {
    opacity: 0.95;
  }
  70% {
    opacity: 0.4;
  }
  71% {
    opacity: 0.85;
  }
}

/* gutters vanish below this; hide panels so they never overlap content */
@media (max-width: 1240px) {
  .hud-panel {
    display: none;
  }
}

/* respect reduced-motion: freeze the flicker to a steady readout */
@media (prefers-reduced-motion: reduce) {
  .hud-panel-block {
    animation: none;
    opacity: 0.85;
  }
}
```

- [ ] **Step 2: Confirm `--amber` fallback**

Run: `grep -n "\-\-amber" src/app/globals.css`
Expected: the rules above reference `var(--amber, #ffb347)`, so a literal
fallback applies even if `--amber` is not defined in `:root`. No `:root` edit
required. (If `grep -n "\-\-amber\|\-\-red" src/app/globals.css` shows a `--red`
token you'd rather use for "down", that's an optional swap — not required.)

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "Style NERV side panels: flicker, color mapping, auto-hide, reduced-motion"
```

---

## Task 5: Mount in HUD and verify end-to-end

**Files:**
- Modify: `src/components/Hud.tsx`

- [ ] **Step 1: Import and render `SidePanels`**

In `src/components/Hud.tsx`, add the import below the existing `StockTicker`
import:

```tsx
import StockTicker from "@/components/StockTicker";
import SidePanels from "@/components/SidePanels";
```

Then inside the `.hud` wrapper, add `<SidePanels />` directly above the
`<StockTicker />` line:

```tsx
      {/* vertical side labels */}
      <div className="hud-side hud-side--left jp">特務機関ネルフ</div>
      <div className="hud-side hud-side--right">CODE : 601 — MAGI</div>

      {/* stock-driven MAGI readouts in the gutters */}
      <SidePanels />

      {/* bottom market-data ticker (live Finnhub feed) */}
      <StockTicker />
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Visual verification (manual)**

Run: `npm run dev`, open the site wide (> 1240px).
Confirm:
- Panels appear in both gutters, flickering.
- With a valid `NEXT_PUBLIC_FINNHUB_KEY`: symbols/SYNC/bars reflect live quotes;
  up moves render green, down moves amber; larger % moves flicker visibly faster.
- Without a key (or offline): ambient FALLBACK_BLOCKS render, PATTERN shows
  ORANGE — panels never look broken.
- Shrink below 1240px: panels disappear, content layout unaffected.
- Network tab: one set of 8 Finnhub calls per 45s interval (not two) with both
  ticker and panels mounted.
- With OS "reduce motion" on: panels render static (no flicker).

- [ ] **Step 5: Commit**

```bash
git add src/components/Hud.tsx
git commit -m "Mount SidePanels in HUD overlay"
```

---

## Self-Review Notes

- **Spec coverage:** shared single poller (Task 1), pure data→visual mapping
  incl. direction+volatility+aggregate (Task 2), abstract MAGI readouts both
  sides with offline fallback (Task 3), flicker/color/auto-hide<1240px/reduced-
  motion (Task 4), decorative `aria-hidden` mount in `.hud` (Tasks 3 & 5). All
  spec sections map to a task.
- **No second poller:** verified in Task 5 Step 4 (network check).
- **Type consistency:** `Quote`/`Status`/`SYMBOLS` defined once in
  `useMarketFeed.ts` and imported everywhere; helper names in `marketViz.ts`
  (`hexId`, `flickRate`, `dirClass`, `barFill`, `barString`, `syncPct`,
  `aggregatePattern`) match their call sites in `SidePanels.tsx`.
- **Determinism:** no `Math.random`/`Date` in render paths (static-export safe).
- **Testing note:** repo has no test runner; verification is typecheck + build +
  the manual visual checklist above, consistent with project conventions.
