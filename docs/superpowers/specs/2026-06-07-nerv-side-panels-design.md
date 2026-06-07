# NERV Side Panels — Design

**Date:** 2026-06-07
**Status:** Approved

## Goal

Fill the empty left/right gutters of the portfolio (content is a 1000px
centered column) with NERV-style, **abstract MAGI readout** panels whose
flicker and color are driven by the live Finnhub market feed already used by
the bottom ticker.

## Constraints

- Free Finnhub tier is rate-limited. The existing `StockTicker` already polls 8
  symbols every 45s. The side panels MUST NOT add a second independent poller —
  the feed is shared so the API call count stays the same.
- Panels are pure decoration: they live in the fixed HUD overlay, never capture
  pointer events, and are hidden from assistive tech.
- Site aesthetic is fixed: NERV green accent `#2bff88`, dark bg `#0a0a0b`, mono
  font `--font-mono`, cut-corner / terminal styling.

## Components

### 1. `src/lib/useMarketFeed.ts` (new)

A shared market-feed hook backed by a module-level singleton so polling happens
**once** no matter how many components subscribe.

- Moves the Finnhub fetch logic (symbols, key, poll interval, quote shape)
  currently inline in `StockTicker.tsx` into this module.
- Singleton holds `{ quotes: Quote[], status: Status }` and a `Set` of
  subscriber callbacks. First subscriber starts the poll; last unsubscribe stops
  it.
- Exports:
  - `interface Quote { sym: string; price: number; dp: number }`
  - `type Status = "connecting" | "live" | "offline"`
  - `function useMarketFeed(): { quotes: Quote[]; status: Status }`
- Behavior unchanged from current ticker logic: `offline` when no key or all
  fetches fail; `live` when at least one quote returns.

### 2. `src/components/StockTicker.tsx` (refactor)

Replace its inline `useEffect`/`useState` polling with `useMarketFeed()`. The
`FALLBACK` flavor array and all rendering/marquee logic stay exactly as-is. No
visual change to the ticker.

### 3. `src/components/SidePanels.tsx` (new)

Renders two fixed panels (`.hud-panel--left`, `.hud-panel--right`) in the
gutters. Consumes `useMarketFeed()`.

Each panel renders a few stacked MAGI-style blocks built from the quotes:

- A hex id line (derived deterministically from symbol/price, e.g.
  `0x` + price digits — no `Math.random` in render).
- `SYNC nn.n%` readout.
- A flickering bar rendered with block glyphs (`█▓▒░`) whose fill ~ tracks
  `|dp|`.
- A `PATTERN` code: BLUE when net-up, ORANGE/RED when net-down.
- A per-symbol numeric readout; panels cycle through `SYMBOLS` so left and right
  show different symbols.

Fallback: when `status === "offline"`, render ambient flavor values mirroring
the ticker's `FALLBACK` spirit so the panels never look broken.

### 4. `src/app/globals.css` (additions)

- `.hud-panel` base + `--left` / `--right` positioning in the gutter
  (`position: fixed; top/bottom`, near the existing `.hud-side` labels).
- `@keyframes` for the flicker (opacity / glow stutter).
- Color + flicker-rate driven by CSS custom properties set inline per block:
  - `--flick-rate` (animation-duration) from `|dp|` — big move = fast.
  - direction sets green (`--accent`) vs amber/red edge color.
- `@media (max-width: 1240px)` hides both panels (`display: none`).
- `@media (prefers-reduced-motion: reduce)` freezes flicker to a static state.

### 5. `src/components/Hud.tsx` (mount)

Render `<SidePanels />` inside the `.hud` wrapper (alongside `<StockTicker />`).

## Data → visual mapping

| Input | Drives |
|-------|--------|
| `dp >= 0` (per symbol) | green vs amber/red |
| `\|dp\|` (per symbol) | `--flick-rate` (faster = bigger), glow intensity, bar fill |
| mean `dp` (aggregate) | top-level PATTERN / consensus readout color |

## Accessibility & behavior

- Panels inside `.hud` (`z-index: 900`, `pointer-events: none`, container is
  `aria-hidden`). Inherit non-interactive, screen-reader-hidden status.
- Auto-hide < 1240px viewport.
- `prefers-reduced-motion: reduce` → no flicker animation.

## Out of scope (YAGNI)

- No new data source / second poller.
- No user controls or settings.
- No changes to ticker visuals.
- No new dependencies.

## Testing

- `npm run build` succeeds (static export).
- Visual check: panels appear in gutters > 1240px, hidden below; flicker
  visibly faster on larger % moves; green/amber tracks direction; offline
  fallback renders flavor text; reduced-motion freezes animation.
- Confirm Finnhub is polled once (single network call set per interval) with
  both ticker and panels mounted.
