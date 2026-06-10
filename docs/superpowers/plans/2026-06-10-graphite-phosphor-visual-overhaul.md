# Graphite & Phosphor Visual Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the always-on NERV cyberpunk skin as the site default with a distinctive professional theme ("Graphite & Phosphor") that ships in light + dark, and relegate the full NERV look to a hidden, per-session skin toggled by the `nerv` keyword or a subtle footer glyph.

**Architecture:** Two orthogonal root-level attributes on `<html>` drive everything via the CSS cascade — `data-theme="light|dark"` swaps the professional palette, and `data-nerv` (present/absent) overlays the NERV skin on top. Three small client hooks built on one shared store own that state; an inline pre-paint script sets `data-theme` before first paint to avoid a flash. `globals.css` is reorganized into three layers: professional base (theme-agnostic, variable-driven), palette (`[data-theme]` blocks), and NERV (everything scoped under `html[data-nerv]`, produced by prefixing today's rules so NERV stays pixel-identical to current `main`).

**Tech Stack:** Next.js 15 (App Router, static export), React 19, TypeScript, `next/font/google`, plain CSS with custom properties. No test runner — verification is `npm run build` (type-check + lint + static export) plus manual checks in the dev server.

---

## File Structure

**New files:**
- `src/lib/createStore.ts` — tiny generic external store (subscribe/get/set + `useValue` via `useSyncExternalStore`). One responsibility: shared reactive state usable by multiple components.
- `src/lib/useTheme.ts` — owns the `light|dark` value and the `data-theme` attribute; localStorage persistence, system-preference seeding.
- `src/lib/useNervMode.ts` — owns the NERV on/off boolean and the `data-nerv` attribute; sessionStorage persistence.

**Modified files:**
- `src/app/globals.css` — restructured into the three layers (the bulk of the work).
- `src/app/layout.tsx` — add the three professional fonts, rename the NERV font CSS-var names, add the inline pre-paint theme script.
- `src/components/NervLayer.tsx` — consume `useNervMode()` instead of local state.
- `src/components/NavBar.tsx` — mono section indices on tabs + a light/dark toggle button.
- `src/components/Footer.tsx` — a subtle NERV toggle glyph.
- `src/components/HeroSection.tsx` — restyle the meta strip into a calm mono status line.

**Unchanged:** `BootSequence`, `Hud`, `SidePanels`, `StockTicker`, `useKeySequence`, `useMarketFeed`, `marketViz`, `basePath`, `site`, all `data/*`, routing, `next.config.ts`.

---

## A note on verification (read once)

There is no test framework in this project, and the spec deliberately keeps it that way (YAGNI). So every task's verification step is one or both of:

1. **Build gate:** `npm run build` — this runs TypeScript type-checking, ESLint, and the static export. Expected: exits 0, ends with `✓ Exporting` and route output; no type or lint errors.
2. **Manual visual check:** `npm run dev`, open `http://localhost:3000/002`, and confirm the named things. To exercise NERV without the keyword you can toggle it in DevTools: select the `<html>` element and add/remove the attribute `data-nerv` (and `data-theme="light"`/`"dark"`).

Keep the dev server running in a second terminal across the CSS tasks so you can eyeball each change.

---

## Task 0: Branch + capture the NERV reference

**Files:** none (git only)

- [ ] **Step 1: Create a feature branch** (we're on `main`; branch before committing)

```bash
git checkout -b feat/graphite-phosphor-overhaul
```

- [ ] **Step 2: Save the current stylesheet as the NERV parity reference**

The current `src/app/globals.css` *is* the NERV skin. We'll use the committed version as the source of truth when building the `html[data-nerv]` layer. Confirm you can read it at any time with:

```bash
git show HEAD:src/app/globals.css | head -50
```

Expected: prints the current stylesheet header (`NERV TERMINAL` comment block). No file is created — this is just confirming the reference command works.

- [ ] **Step 3: Confirm a clean baseline build**

Run: `npm run build`
Expected: exits 0, static export completes. (Establishes that anything that breaks later is ours.)

---

## Task 1: Generic external store helper

**Files:**
- Create: `src/lib/createStore.ts`

- [ ] **Step 1: Write the store**

```ts
import { useSyncExternalStore } from "react";

// Minimal shared reactive store. Lets multiple components read and drive the
// same value and re-render together — used by the theme and NERV-mode hooks so
// the nav toggle, the footer glyph, and the keyword listener stay in sync.
export interface Store<T> {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (onChange: () => void) => () => void;
  useValue: () => T;
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();

  const get = () => value;

  const set = (next: T | ((prev: T) => T)) => {
    value = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
    listeners.forEach((l) => l());
  };

  const subscribe = (onChange: () => void) => {
    listeners.add(onChange);
    return () => listeners.delete(onChange);
  };

  // Server snapshot == client initial value, so SSR and first client render
  // match (we only ever `set` inside effects, post-hydration).
  const useValue = () => useSyncExternalStore(subscribe, get, get);

  return { get, set, subscribe, useValue };
}
```

- [ ] **Step 2: Verify it type-checks / builds**

Run: `npm run build`
Expected: exits 0, no type errors. (`createStore` is exported and unused so far — that's fine.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/createStore.ts
git commit -m "Add generic useSyncExternalStore-based shared store helper"
```

---

## Task 2: `useTheme` hook (light/dark)

**Files:**
- Create: `src/lib/useTheme.ts`

- [ ] **Step 1: Write the hook**

```ts
"use client";

import { useEffect } from "react";
import { createStore } from "@/lib/createStore";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

// Default snapshot is "dark"; the real value is resolved from localStorage /
// system preference in an effect after mount (and by the inline pre-paint
// script for first paint — see layout.tsx).
const themeStore = createStore<Theme>("dark");

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function resolveInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* localStorage unavailable */
  }
  try {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch {
    /* matchMedia unavailable */
  }
  return "dark";
}

export function useTheme() {
  const theme = themeStore.useValue();

  // Sync the store to the real value on mount (the attribute itself was already
  // applied pre-paint by the inline script; this just aligns the store so the
  // toggle button shows the correct state).
  useEffect(() => {
    const initial = resolveInitialTheme();
    themeStore.set(initial);
    applyTheme(initial);
  }, []);

  const setTheme = (next: Theme) => {
    themeStore.set(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const toggle = () => setTheme(themeStore.get() === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exits 0, no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/useTheme.ts
git commit -m "Add useTheme hook (light/dark, localStorage + system seeding)"
```

---

## Task 3: `useNervMode` hook

**Files:**
- Create: `src/lib/useNervMode.ts`

- [ ] **Step 1: Write the hook**

```ts
"use client";

import { useEffect } from "react";
import { createStore } from "@/lib/createStore";

const STORAGE_KEY = "nerv-mode";

// Default false (SSR-safe: first render is always false, so server and client
// markup match). An effect re-enables if this session previously turned it on.
const nervStore = createStore<boolean>(false);

function applyNerv(on: boolean) {
  const el = document.documentElement;
  if (on) el.setAttribute("data-nerv", "");
  else el.removeAttribute("data-nerv");
}

export function useNervMode() {
  const enabled = nervStore.useValue();

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        nervStore.set(true);
        applyNerv(true);
      }
    } catch {
      /* sessionStorage unavailable — stay disabled */
    }
  }, []);

  const toggle = () => {
    const next = !nervStore.get();
    nervStore.set(next);
    applyNerv(next);
    try {
      if (next) sessionStorage.setItem(STORAGE_KEY, "1");
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return { enabled, toggle };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exits 0, no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/useNervMode.ts
git commit -m "Add useNervMode hook (data-nerv attribute, sessionStorage)"
```

---

## Task 4: Refactor `NervLayer` to use the shared hook

**Files:**
- Modify: `src/components/NervLayer.tsx` (full rewrite)

**Note:** After this task, toggling `nerv` sets the `data-nerv` attribute on `<html>`. The CSS doesn't react to it yet (the NERV layer is built in Task 6), so NERV mode looks the same as today (the base skin is still all-NERV until Task 5). No visible regression here.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import BootSequence from "@/components/BootSequence";
import Hud from "@/components/Hud";
import { useKeySequence } from "@/lib/useKeySequence";
import { useNervMode } from "@/lib/useNervMode";

// Gates the NERV "flavor" layers. The professional theme is the default; typing
// `nerv` (or clicking the footer glyph) toggles the boot sequence + HUD overlay
// and the `data-nerv` skin on/off. State lives in useNervMode (sessionStorage),
// shared with the footer toggle.
export default function NervLayer() {
  const { enabled, toggle } = useNervMode();

  useKeySequence("nerv", toggle);

  if (!enabled) return null;

  return (
    <>
      <BootSequence />
      <Hud />
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 3: Manual check — keyword still toggles boot/HUD**

`npm run dev`, open `http://localhost:3000/002`, type `nerv`. Expected: boot sequence plays + HUD appears (same as before). Type `nerv` again: HUD disappears. In DevTools, confirm the `<html>` element gains/loses `data-nerv` as you toggle.

- [ ] **Step 4: Commit**

```bash
git add src/components/NervLayer.tsx
git commit -m "Refactor NervLayer to consume shared useNervMode hook"
```

---

## Task 5: CSS foundation — fonts, tokens, globals, pre-paint script

This task makes the **default** site Graphite & Phosphor (dark), wires the three professional fonts, adds the light palette, and relocates the global NERV effects (scanlines, grid, vignette, flicker) under `html[data-nerv]`. Component *shapes* are still the old angular rules until Tasks 6–8; that's an expected transitional state.

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the professional fonts and rename the NERV font vars in `layout.tsx`**

Replace the font imports/declarations block (lines 1–30) so the three NERV faces get non-colliding variable names and the three professional faces are added:

```tsx
import type { Metadata } from "next";
import {
  Chakra_Petch,
  Saira,
  JetBrains_Mono,
  Space_Grotesk,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import NervLayer from "@/components/NervLayer";
import "@/app/globals.css";

// ---- NERV mode faces (angular terminal identity) ----
const chakra = Chakra_Petch({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-chakra",
  weight: ["400", "500", "600", "700"],
});
const saira = Saira({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-saira",
  weight: ["400", "500", "600", "700"],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

// ---- Professional theme faces (Graphite & Phosphor) ----
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-grotesk",
  weight: ["400", "500", "600", "700"],
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-sans",
  weight: ["400", "500", "600"],
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});
```

- [ ] **Step 2: Update the `<html>` className and add the pre-paint script in `layout.tsx`**

Replace the `RootLayout` return (lines 55–76) with:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable} ${chakra.variable} ${saira.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Set the light/dark theme before first paint to avoid a flash. Reads
            the saved choice, else the OS preference. Does NOT touch data-nerv. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');" +
              "if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}" +
              "document.documentElement.setAttribute('data-theme',t);}" +
              "catch(e){document.documentElement.setAttribute('data-theme','dark');}})();",
          }}
        />
        <link rel="icon" href={FAVICON} />
      </head>
      <body>
        <NervLayer />
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

(Leave the `metadata` export and `FAVICON` constant as they are.)

- [ ] **Step 3: Replace the `:root` token block in `globals.css`**

Replace the entire `:root { ... }` block (current lines 7–48) with the professional token system below. This defines dark as the `:root` fallback, plus explicit `[data-theme]` blocks.

```css
:root {
  /* ---- Graphite & Phosphor — DARK (default / fallback) ---- */
  --bg: #14161a;
  --bg-2: #101216;
  --panel: #1b1e23;
  --panel-2: #202329;
  --text: #e7e6e1;
  --text-muted: #9aa0a3;
  --text-dim: #71767a;
  --line: #2a2e34;
  --line-soft: #23262b;
  --accent: #5fae86;
  --accent-hover: #74c79b;
  --accent-wash: rgba(95, 174, 134, 0.1);
  /* label color that sits ON an accent fill, and the fill itself (kept AA) */
  --on-accent: #14161a;
  --btn-primary-bg: var(--accent);

  /* ---- Shape ---- */
  --radius: 4px;
  --radius-pill: 4px;
  --notch: 0px;

  /* ---- Type ---- */
  --font-display: var(--font-grotesk), "Space Grotesk", system-ui, sans-serif;
  --font-body: var(--font-plex-sans), "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: var(--font-plex-mono), "IBM Plex Mono", ui-monospace, Menlo,
    monospace;

  /* ---- Layout ---- */
  --content-width: 1000px;
  --nav-height: 60px;
}

[data-theme="dark"] {
  color-scheme: dark;
  --bg: #14161a;
  --bg-2: #101216;
  --panel: #1b1e23;
  --panel-2: #202329;
  --text: #e7e6e1;
  --text-muted: #9aa0a3;
  --text-dim: #71767a;
  --line: #2a2e34;
  --line-soft: #23262b;
  --accent: #5fae86;
  --accent-hover: #74c79b;
  --accent-wash: rgba(95, 174, 134, 0.1);
  --on-accent: #14161a;
  --btn-primary-bg: var(--accent);
}

[data-theme="light"] {
  color-scheme: light;
  --bg: #f4f3ee;
  --bg-2: #eeece4;
  --panel: #fbfaf6;
  --panel-2: #f3f1ea;
  --text: #1b1d1f;
  --text-muted: #5c5f63;
  --text-dim: #80837f;
  --line: #dcd9cf;
  --line-soft: #e7e4db;
  --accent: #2f7d57;
  --accent-hover: #266546;
  --accent-wash: rgba(47, 125, 87, 0.1);
  /* on light, fill with the darker accent + white label so the label clears AA */
  --on-accent: #ffffff;
  --btn-primary-bg: var(--accent-hover);
}
```

- [ ] **Step 4: Rewrite the global element rules in `globals.css` (strip NERV effects from base)**

Replace the rules for `html`, `body`, `body::before`, `body::after`, `html::after` (the scanline overlay, currently ~lines 58–121), `::selection`, `a`, and the `.hazard` helper (currently ~lines 123–143) with the professional versions, and move the NERV global effects under `html[data-nerv]`. Use exactly:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-body);
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.65;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  position: relative;
}

::selection {
  background: var(--accent);
  color: var(--on-accent);
}

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  color: var(--accent-hover);
}

/* ---- NERV global effects (only in NERV mode) ---- */
html[data-nerv] {
  color-scheme: dark;
}

/* hex/line grid + vignette backdrop */
html[data-nerv] body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px),
    radial-gradient(120% 90% at 50% -10%, var(--bg-2), var(--bg) 70%);
  background-size: 44px 44px, 44px 44px, 100% 100%;
}

html[data-nerv] body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background: radial-gradient(
    100% 100% at 50% 40%,
    transparent 55%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

/* CRT scanline overlay + flicker */
html[data-nerv]::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0,
    rgba(0, 0, 0, 0) 2px,
    rgba(0, 0, 0, 0.22) 3px
  );
  mix-blend-mode: multiply;
  opacity: 0.55;
  animation: crtFlicker 7s linear infinite;
}

html[data-nerv] .hazard,
html[data-nerv] .btn--primary::before {
  background-image: repeating-linear-gradient(
    -45deg,
    var(--accent) 0,
    var(--accent) 9px,
    #000 9px,
    #000 18px
  );
}
```

- [ ] **Step 5: Add the NERV variable + font overrides in `globals.css`**

Add this block immediately after the `[data-theme="light"]` block (it restores the green readout palette, angular shape tokens, and NERV fonts whenever `data-nerv` is present, regardless of light/dark):

```css
/* ================================================================
   NERV layer — variable + font overrides (skin sits on top of any theme)
   ================================================================ */
html[data-nerv] {
  --bg: #0a0a0b;
  --bg-2: #0e0e10;
  --panel: #0c0c0e;
  --panel-2: #111114;
  --accent: #2bff88;
  --accent-dim: #1f9e5a;
  --accent-bright: #aaff33;
  --accent-hover: #aaff33;
  --red: #e60012;
  --green: #2bff88;
  --blue: #36c5ff;
  --line: rgba(43, 255, 136, 0.3);
  --line-soft: rgba(43, 255, 136, 0.15);
  --grid: rgba(43, 255, 136, 0.05);
  --text: #ededed;
  --text-muted: #9a9a93;
  --text-dim: #61675f;
  --accent-wash: rgba(43, 255, 136, 0.1);
  --accent-glow: rgba(43, 255, 136, 0.5);
  --on-accent: #000;
  --btn-primary-bg: var(--accent);
  --notch: 14px;
  --radius: 0px;
  --radius-pill: 0px;
  --font-display: var(--font-chakra), "Chakra Petch", system-ui, sans-serif;
  --font-body: var(--font-saira), "Saira", system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), "JetBrains Mono", ui-monospace, Menlo,
    monospace;
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: exits 0. (There may be CSS referencing `var(--accent-glow)` etc. in still-unscoped component rules — that's fine; those vars resolve to the NERV values only under `[data-nerv]` and to nothing in base, which is acceptable until Tasks 6–8 rewrite those rules.)

- [ ] **Step 7: Manual check — professional dark default + flash-free**

`npm run dev`, open `http://localhost:3000/002`. Expected: page background is warm graphite `#14161a`, text is light, **no scanlines, no green grid backdrop, no CRT flicker**. (Component shapes still look angular/uppercase — expected; fixed next.) Set your OS to light mode and hard-reload: background should be warm paper `#f4f3ee` with no flash of dark. In DevTools add `data-nerv` to `<html>`: the green grid + scanlines return.

- [ ] **Step 8: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "CSS foundation: professional tokens, fonts, pre-paint theme, NERV globals scoped"
```

---

## Task 6: Professional components — nav, hero, buttons, badges + section masthead

For each component group from here on, the procedure is the same three moves:
**(a)** copy the current rule(s) for these selectors, prefix each selector with `html[data-nerv]`, and paste into the NERV section (restores the NERV look at higher specificity); **(b)** replace the original base rule with the professional version below; **(c)** build + verify both looks.

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Scope the current nav/hero/button/badge skin under `html[data-nerv]`**

In `globals.css`, locate the current rules for these selectors and **duplicate them into the NERV section with an `html[data-nerv]` prefix** on each selector (keep the originals for now — Step 2 overwrites them):

- `.nav`, `.nav-brand .brand-mark`, `.nav-brand .brand-name`, `.nav-tab`, `.nav-tab::after`, `.nav-tab:hover`, `.nav-tab--active`
- `.glass-card`, `.glass-card::before`, `.glass-card::after`
- `.section-eyebrow`, `.section-eyebrow::before`, `.section-heading`
- `.btn`, `.btn:hover`, `.btn--primary`, `.btn--primary:hover`, `.btn--ghost`, `.btn--ghost:hover`
- `.badge`, `.badge::before`, `.tag`, `.tag:hover`, `.tag--active`
- `.hero`, `.hero-greeting`, `.hero-greeting::before`, `.hero-title`, `.hero-title .grad`, `.hero-role`, `.hero-role .grad`, `.hero-meta`, `.status-dot`, `.hero-kanji`, `.caret`, `.hero-gauge`, `.gauge-*`

Example transform (do this for each selector above):

```css
/* base (will be replaced in Step 2) → NERV copy: */
html[data-nerv] .glass-card {
  position: relative;
  background: var(--panel);
  border: 1px solid var(--line);
  padding: 2.4rem;
  clip-path: polygon(
    0 0,
    calc(100% - var(--notch)) 0,
    100% var(--notch),
    100% 100%,
    var(--notch) 100%,
    0 calc(100% - var(--notch))
  );
}
html[data-nerv] .glass-card::before { /* ...copied verbatim... */ }
html[data-nerv] .glass-card::after { /* ...copied verbatim... */ }
```

- [ ] **Step 2: Replace the base rules with the professional versions**

Overwrite the original (now-unscoped) rules with these:

```css
/* ---- Navigation ---- */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: var(--nav-height);
  display: flex;
  align-items: stretch;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
}

.nav-brand .brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: var(--panel-2);
  border: 1px solid var(--line);
  color: var(--text);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.8rem;
  border-radius: var(--radius);
}

.nav-brand .brand-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.02rem;
  letter-spacing: -0.01em;
  color: var(--text);
}

/* mono index that prefixes each tab label (added in NavBar, Task 9) */
.nav-tab-index {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  color: var(--text-dim);
  margin-right: 0.5ch;
}

.nav-tab {
  appearance: none;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  padding: 0 0.85rem;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  transition: color 0.15s ease;
}

.nav-tab::after {
  content: "";
  position: absolute;
  left: 0.85rem;
  right: 0.85rem;
  bottom: 0;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.18s ease;
}

.nav-tab:hover {
  color: var(--text);
}

.nav-tab--active {
  color: var(--text);
}

.nav-tab--active::after {
  transform: scaleX(1);
}

.nav-tab--active .nav-tab-index {
  color: var(--accent);
}

.nav-tab:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -3px;
  border-radius: 2px;
}

/* light/dark toggle button (added in NavBar, Task 9) */
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  align-self: center;
  margin-left: 0.5rem;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.theme-toggle:hover {
  color: var(--text);
  border-color: var(--text-dim);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ---- Panels / cards ---- */
.glass-card {
  position: relative;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 2.4rem;
}

/* corner brackets are a NERV-only flourish */
.glass-card::before,
.glass-card::after {
  content: none;
}

/* ---- Section masthead rhythm ---- */
.section-eyebrow {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-dim);
  padding-bottom: 0.75rem;
  margin-bottom: 1.1rem;
  border-bottom: 1px solid var(--line);
}

.section-eyebrow::before {
  content: none;
}

.section-heading {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin-bottom: 0.75rem;
  color: var(--text);
}

.section-intro {
  color: var(--text-muted);
  font-size: 1.02rem;
  margin-bottom: 2rem;
  max-width: 64ch;
}

.prose p {
  color: var(--text-muted);
  font-size: 1.02rem;
  margin-bottom: 1.1rem;
}

.prose p:last-child {
  margin-bottom: 0;
}

.prose strong {
  color: var(--text);
  font-weight: 600;
}

/* ---- Buttons ---- */
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.02em;
  padding: 0.62rem 1.15rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  cursor: pointer;
  overflow: hidden;
  background: transparent;
  color: var(--text);
  clip-path: none;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.btn:hover {
  border-color: var(--text-dim);
  background: var(--panel-2);
  box-shadow: none;
}

.btn:active {
  transform: translateY(1px);
}

.btn--primary {
  background: var(--btn-primary-bg);
  color: var(--on-accent);
  border-color: var(--btn-primary-bg);
  font-weight: 600;
}

.btn--primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  color: var(--on-accent);
}

.btn--ghost {
  color: var(--text);
  border-color: var(--line);
}

.btn--ghost:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: transparent;
}

.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ---- Tags / badges (outlined chips) ---- */
.badge {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  text-transform: none;
  letter-spacing: 0.02em;
  padding: 0.22rem 0.55rem;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--text-muted);
}

.badge::before {
  content: none;
}

.tag {
  appearance: none;
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: none;
  letter-spacing: 0.02em;
  padding: 0.3rem 0.75rem;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.14s ease, border-color 0.14s ease;
}

.tag:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.tag--active {
  color: var(--on-accent);
  background: var(--btn-primary-bg);
  border-color: var(--btn-primary-bg);
  font-weight: 600;
}

/* ---- Hero ---- */
.hero {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
  padding: 3rem 2.4rem;
  border-top: none;
  border-image: none;
}

.hero-greeting {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.hero-greeting::before {
  content: none;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 8vw, 4.5rem);
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.03em;
  line-height: 1.0;
  color: var(--text);
}

.hero-title .grad {
  color: var(--text);
  text-shadow: none;
}

.hero-role {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 3.2vw, 1.7rem);
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: var(--text);
  max-width: 34ch;
}

.hero-role .grad {
  color: var(--accent);
}

.hero-lead {
  color: var(--text-muted);
  font-size: 1.06rem;
  max-width: 58ch;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 0.4rem;
  padding-top: 1.3rem;
  border-top: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-dim);
}

.hero-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* steady status dot in the professional theme (NERV makes it blink) */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: none;
  animation: none;
}

/* decorative NERV-only hero elements: hidden in the professional theme */
.hero-kanji,
.caret,
.hero-gauge {
  display: none;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 4: Manual check — both looks for this group**

`npm run dev`, `http://localhost:3000/002`:
- **Professional:** hero shows sentence-case Space Grotesk name (no kanji, no blinking caret, no synchro gauges), the nav tabs are sentence-case, buttons are 4px-radius outlined/filled, the "View Projects" primary button label is legible. Toggle OS light/dark (or set `data-theme` in DevTools) — both read cleanly.
- **NERV (add `data-nerv` in DevTools):** hero/nav/buttons return to the angular green uppercase look with kanji, caret, gauges, and corner brackets.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "Professional styling for nav, hero, buttons, badges, section masthead"
```

---

## Task 7: Professional components — cards, blog, skills, timeline, contact

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Scope the current skin for this group under `html[data-nerv]`**

As in Task 6 Step 1, duplicate the current rules for these selectors into the NERV section with an `html[data-nerv]` prefix (keep originals for Step 2 to overwrite):

`.card-grid`, `.project-card`, `.project-card:hover`, `.project-card h3`, `.card-meta`, `.project-card p`, `.card-links`, `.blog-toolbar`, `.search-input`, `.search-input::placeholder`, `.search-input:focus`, `.blog-filters`, `.blog-list`, `.blog-post`, `.blog-post:hover`, `.blog-post h3`, `.blog-post:hover h3`, `.blog-post p`, `.blog-post-foot`, `.read-more`, `.blog-post:hover .read-more`, `.empty-state`, `.skill-groups`, `.skill-group`, `.skill-group h3`, `.skill-group h3::before`, `.skill-group .badge`, `.timeline`, `.timeline::before`, `.timeline-item`, `.timeline-item::before`, `.timeline-head`, `.timeline-role`, `.timeline-company`, `.timeline-period`, `.timeline-bullets`, `.timeline-bullets li`, `.timeline-bullets li::before`, `.contact-grid`, `.contact-tile`, `.contact-tile:hover`, `.contact-tile .tile-icon`, `.contact-tile .tile-label`, `.contact-tile .tile-value`, `.group-heading`, `.group-heading:first-of-type`, `.project-card-head`, `.project-status`, `.coming-soon`, `.coming-soon-title`, `.coming-soon-sub`, `.about-intro`, `.about-photo`, `.about-note`.

- [ ] **Step 2: Replace the base rules with professional versions**

```css
/* ---- Project cards (accent left-rule on hover/active) ---- */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.1rem;
}

.project-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-left: 2px solid var(--line);
  border-radius: var(--radius);
  padding: 1.4rem;
  transition: border-color 0.18s ease, border-left-color 0.18s ease,
    background 0.18s ease;
}

.project-card:hover {
  background: var(--panel-2);
  border-color: var(--line);
  border-left-color: var(--accent);
  box-shadow: none;
  transform: none;
}

.project-card h3 {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.01em;
  line-height: 1.15;
}

.card-meta {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
}

.project-card p {
  color: var(--text-muted);
  font-size: 0.94rem;
}

.project-card .badge-row {
  margin-top: auto;
}

.card-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.4rem;
}

/* ---- Blog ---- */
.blog-toolbar {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  max-width: 380px;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.62rem 0.95rem;
  transition: border-color 0.15s ease;
}

.search-input::placeholder {
  color: var(--text-dim);
  text-transform: none;
  font-size: 0.82rem;
  letter-spacing: 0;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-wash);
}

.blog-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.6rem;
}

.blog-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.blog-post {
  position: relative;
  display: block;
  background: var(--panel);
  border: 1px solid var(--line);
  border-left: 2px solid var(--line);
  border-radius: var(--radius);
  padding: 1.4rem 1.5rem;
  transition: border-color 0.18s ease, border-left-color 0.18s ease,
    background 0.18s ease;
}

.blog-post:hover {
  background: var(--panel-2);
  border-left-color: var(--accent);
  box-shadow: none;
  transform: none;
}

.blog-post h3 {
  font-family: var(--font-display);
  font-size: 1.22rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.01em;
  line-height: 1.18;
  margin-bottom: 0.35rem;
  transition: color 0.16s ease;
}

.blog-post:hover h3 {
  color: var(--accent);
}

.blog-post p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0.5rem 0 0.85rem;
}

.blog-post-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1rem;
}

.read-more {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  opacity: 0.7;
  transition: opacity 0.18s ease;
}

.blog-post:hover .read-more {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-transform: none;
  letter-spacing: 0.04em;
}

/* ---- Skills ---- */
.skill-groups {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.1rem;
}

.skill-group {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1rem;
}

.skill-group h3 {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  margin-bottom: 1rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid var(--line);
}

.skill-group h3::before {
  content: none;
}

.skill-group .badge {
  font-size: 0.66rem;
  letter-spacing: 0.02em;
  padding: 0.2rem 0.45rem;
}

/* ---- Experience timeline (ledger-aligned dates) ---- */
.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.85rem;
  padding-left: 1.9rem;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 6px;
  bottom: 6px;
  width: 1px;
  background: var(--line);
}

.timeline-item {
  position: relative;
}

/* small square node (NERV uses a glowing hexagon) */
.timeline-item::before {
  content: "";
  position: absolute;
  left: -1.9rem;
  top: 7px;
  width: 9px;
  height: 9px;
  background: var(--accent);
  box-shadow: none;
  clip-path: none;
  border-radius: 1px;
}

.timeline-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.timeline-role {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.01em;
}

.timeline-company {
  color: var(--accent);
  font-weight: 600;
}

.timeline-period {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-dim);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.timeline-bullets {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.timeline-bullets li {
  position: relative;
  padding-left: 1.3rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.timeline-bullets li::before {
  content: "–";
  position: absolute;
  left: 0;
  top: 0;
  color: var(--text-dim);
}

/* ---- Contact ---- */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.1rem;
  margin-top: 1.6rem;
}

.contact-tile {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-left: 2px solid var(--line);
  border-radius: var(--radius);
  padding: 1.15rem 1.3rem;
  transition: border-color 0.18s ease, border-left-color 0.18s ease,
    background 0.18s ease;
}

.contact-tile:hover {
  background: var(--panel-2);
  border-left-color: var(--accent);
  box-shadow: none;
  transform: none;
}

.contact-tile .tile-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--panel-2);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  font-size: 1.05rem;
  flex-shrink: 0;
  filter: none;
}

.contact-tile .tile-label {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
}

.contact-tile .tile-value {
  font-weight: 600;
  color: var(--text);
  word-break: break-word;
}

/* ---- Group sub-headings ---- */
.group-heading {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  margin: 2.25rem 0 1.1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--line);
}

.group-heading:first-of-type {
  margin-top: 1rem;
}

.project-card-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.project-status {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.18rem 0.5rem;
  border-radius: var(--radius);
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--accent);
}

/* ---- Blog coming-soon ---- */
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  padding: 4rem 1rem 3.5rem;
  text-align: center;
}

.coming-soon-title {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 5vw, 2.6rem);
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0;
  text-shadow: none;
}

.coming-soon-sub {
  color: var(--text-muted);
  margin: 0;
  max-width: 42ch;
}

/* ---- About intro ---- */
.about-intro {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}

.about-photo {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  flex-shrink: 0;
}

.about-note {
  color: var(--text-dim);
  font-style: italic;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 4: Manual check — both looks for this group**

`npm run dev`. Visit each tab (`#projects`, `#blog`, `#skills`, `#experience`, `#contact`):
- **Professional:** cards/tiles have a thin neutral left edge that turns phosphor green on hover; chips are outlined; timeline uses small square nodes + en-dash bullets; dates align in mono. Check light + dark.
- **NERV (DevTools `data-nerv`):** every element returns to the green angular look.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "Professional styling for cards, blog, skills, timeline, contact"
```

---

## Task 8: Professional components — article/detail pages + footer

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Scope the current skin for this group under `html[data-nerv]`**

Duplicate the current rules for these selectors into the NERV section with an `html[data-nerv]` prefix:

`.article`, `.back-link`, `.back-link:hover`, `.article-header`, `.article-title`, `.article-meta`, `.article-links`, `.article-body`, `.article-body > * + *`, `.article-body h2`, `.article-body h3`, `.article-body strong`, `.article-body em`, `.article-body a`, `.article-body ul`, `.article-body ol`, `.article-body li::marker`, `.article-body blockquote`, `.article-body code`, `.article-body pre`, `.article-body pre code`, `.article-body hr`, `.article-foot`, `.site-footer`, `.footer-inner`, `.footer-links`, `.footer-links a`, `.footer-links a:hover`.

- [ ] **Step 2: Replace the base rules with professional versions**

```css
/* ---- Article (blog post / project detail) ---- */
.article {
  padding: 2.4rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  text-transform: none;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: transparent;
  transition: color 0.16s ease, border-color 0.16s ease;
}

.back-link:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: transparent;
}

.article-header {
  margin: 1.75rem 0 2rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid var(--line);
}

.article-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.025em;
  line-height: 1.05;
  color: var(--text);
  margin-bottom: 1rem;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
}

.article-links {
  margin-top: 1.4rem;
}

.article-body {
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--text-muted);
}

.article-body > * + * {
  margin-top: 1.15rem;
}

.article-body h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.01em;
  color: var(--text);
  margin-top: 2.4rem;
  padding-left: 0.8rem;
  border-left: 2px solid var(--accent);
}

.article-body h3 {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: none;
  color: var(--text);
  margin-top: 1.8rem;
}

.article-body strong {
  color: var(--text);
  font-weight: 600;
}

.article-body em {
  color: var(--text);
  font-style: italic;
}

.article-body a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.article-body ul,
.article-body ol {
  padding-left: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.article-body li::marker {
  color: var(--text-dim);
}

.article-body blockquote {
  margin: 1.6rem 0;
  padding: 0.9rem 1.3rem;
  border-left: 2px solid var(--accent);
  background: var(--panel);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 1.08rem;
  line-height: 1.6;
}

.article-body code {
  font-family: var(--font-mono);
  font-size: 0.86em;
  background: var(--panel-2);
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 0.1em 0.4em;
  color: var(--text);
}

.article-body pre {
  margin: 1.6rem 0;
  padding: 1.1rem 1.3rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow-x: auto;
  line-height: 1.6;
}

.article-body pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.86rem;
  color: var(--text);
}

.article-body hr {
  border: none;
  border-top: 1px solid var(--line);
  margin: 2rem 0;
}

.article-foot {
  margin-top: 2.5rem;
  padding-top: 1.6rem;
  border-top: 1px solid var(--line);
}

/* ---- Footer ---- */
.site-footer {
  border-top: 1px solid var(--line);
  margin-top: 3rem;
  padding: 2rem 0 3rem;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.74rem;
  text-transform: none;
  letter-spacing: 0.02em;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 1.4rem;
}

.footer-links a {
  color: var(--text-muted);
  transition: color 0.15s ease;
}

.footer-links a:hover {
  color: var(--accent);
}

/* subtle NERV toggle glyph in the footer (added in Footer, Task 10) */
.nerv-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--line-soft);
  border-radius: 3px;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.nerv-glyph:hover {
  opacity: 1;
  color: var(--accent);
  border-color: var(--accent);
}

.nerv-glyph:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  opacity: 1;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 4: Manual check — detail pages + footer in both looks**

`npm run dev`. Open a project detail page (e.g. `http://localhost:3000/002/projects/<an id from src/data/projects.ts>`) and a blog post. Confirm professional article styling (no green glow, hairline rules, readable code blocks) in light + dark, and the NERV look via DevTools `data-nerv`. Footer reads quietly.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "Professional styling for article/detail pages and footer"
```

---

## Task 9: NavBar — mono section indices + light/dark toggle

**Files:**
- Modify: `src/components/NavBar.tsx`

- [ ] **Step 1: Add the index map, theme hook, and toggle button**

Replace the file with:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/useTheme";

const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof NAV_ITEMS)[number]["id"];

// Two-digit mono index shown before each tab label (01..06).
const pad2 = (n: number) => String(n + 1).padStart(2, "0");

export default function NavBar() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [hash, setHash] = useState("");
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const sync = () => setHash(window.location.hash.replace(/^#/, ""));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  let active: SectionId | "" = "";
  if (pathname.startsWith("/blog")) {
    active = "blog";
  } else if (pathname.startsWith("/projects")) {
    active = "projects";
  } else if (NAV_ITEMS.some((item) => item.id === hash)) {
    active = hash as SectionId;
  }

  return (
    <nav className="nav" role="navigation" aria-label="Site sections">
      <div className="site-container nav-inner">
        {onHome ? (
          <a className="nav-brand" href="#" aria-label="Home">
            <span className="brand-mark">LS</span>
            <span className="brand-name">Liam Sango</span>
          </a>
        ) : (
          <Link className="nav-brand" href="/" aria-label="Home">
            <span className="brand-mark">LS</span>
            <span className="brand-name">Liam Sango</span>
          </Link>
        )}

        <div className="nav-tabs">
          {NAV_ITEMS.map((item, i) => {
            const className = `nav-tab${
              active === item.id ? " nav-tab--active" : ""
            }`;
            const current = active === item.id ? "page" : undefined;
            const inner = (
              <>
                <span className="nav-tab-index" aria-hidden="true">
                  {pad2(i)}
                </span>
                {item.label}
              </>
            );
            return onHome ? (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={className}
                aria-current={current}
              >
                {inner}
              </a>
            ) : (
              <Link
                key={item.id}
                href={`/#${item.id}`}
                className={className}
                aria-current={current}
              >
                {inner}
              </Link>
            );
          })}

          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            title="Toggle light/dark theme"
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 3: Manual check — indices + working toggle + persistence**

`npm run dev`. Expected: tabs read `01 About 02 Skills … 06 Contact` with the index in mono; a sun/moon button sits at the end of the tabs. Click it — the whole page swaps light⇄dark instantly. Reload — your choice persists (localStorage). Open a fresh tab with no stored choice and your OS in the opposite mode — it follows the OS. Active tab's index turns phosphor green.

- [ ] **Step 4: Commit**

```bash
git add src/components/NavBar.tsx
git commit -m "NavBar: mono section indices + light/dark toggle"
```

---

## Task 10: Footer — subtle NERV toggle glyph

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Rewrite Footer as a client component with the glyph**

```tsx
"use client";

import { SOCIALS } from "@/lib/site";
import { useNervMode } from "@/lib/useNervMode";

export default function Footer() {
  const { toggle } = useNervMode();

  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <span>© {new Date().getFullYear()} Liam Sango</span>
        <div className="footer-links">
          <a href={SOCIALS.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={SOCIALS.email}>Email</a>
          <a href={SOCIALS.source} target="_blank" rel="noopener noreferrer">
            Source
          </a>
          {/* Subtle easter-egg toggle for NERV mode (also via typing `nerv`). */}
          <button
            type="button"
            className="nerv-glyph"
            onClick={toggle}
            aria-label="Toggle NERV mode"
            title="NERV"
          >
            <span aria-hidden="true">⬡</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 3: Manual check — glyph toggles NERV, in sync with keyword**

`npm run dev`. Expected: a faint hex glyph sits at the end of the footer links; it brightens on hover. Click it — NERV boots and the full skin applies. Click again — back to professional. Type `nerv` — same toggle; the glyph and keyword drive one shared state.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "Footer: subtle NERV-mode toggle glyph"
```

---

## Task 11: HeroSection — calm mono status line

**Files:**
- Modify: `src/components/HeroSection.tsx`

- [ ] **Step 1: Replace the `.hero-meta` block**

In `src/components/HeroSection.tsx`, replace the `<div className="hero-meta">…</div>` block (lines 49–55) with a calm mono status line (no emoji, steady dot):

```tsx
      <div className="hero-meta">
        <span>
          <span className="status-dot" aria-hidden="true" /> Available for work
        </span>
        <span>Remote · Australia</span>
        <span>Last updated 2026.06</span>
      </div>
```

(The kanji, caret, and the two `hero-gauge` blocks stay in the markup — they're already hidden by CSS in the professional theme and return under `data-nerv`. No structural change.)

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 3: Manual check**

`npm run dev`. Expected (professional): hero footer reads as a mono status line — a steady green dot + `Available for work · Remote · Australia · Last updated 2026.06`, no emoji. Under NERV (DevTools `data-nerv`), the dot blinks and the gauges/kanji/caret return.

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroSection.tsx
git commit -m "HeroSection: calm mono status line (no emoji)"
```

---

## Task 12: Full verification matrix + NERV parity check

**Files:** none (verification + any fixes uncovered)

- [ ] **Step 1: Clean production build**

Run: `npm run build`
Expected: exits 0; no type or lint errors; static export of all routes (home, `/projects/*`, `/blog/*`) completes.

- [ ] **Step 2: Professional theme matrix (manual)**

`npm run dev`. With **no** `data-nerv`, walk every section (hero + the six tabs) and a project + blog detail page, in **both** light and dark (use the nav toggle). Confirm for each:
- Warm graphite/paper background; sentence-case Space Grotesk headings; IBM Plex Sans body; mono metadata.
- **Accent scarcity:** at rest, the only green per view is at most the status dot and the active tab index; green otherwise appears only on hover/active/links/focus. No glows, no scanlines, no grid backdrop, no kanji/caret/gauges.
- 4px radii, 1px hairline borders, outlined chips, accent left-rule on card/tile/post hover.

- [ ] **Step 3: Accessibility spot-check**

In both light and dark: confirm the primary button label (hero "View Projects") is clearly legible against its fill, body text is comfortable, and `Tab` focus shows a visible green outline on links/buttons/tabs/toggle.

- [ ] **Step 4: NERV parity check against current `main`**

Capture the reference look and compare:

```bash
git stash -u 2>/dev/null; git worktree add /tmp/nerv-ref main 2>/dev/null || true
```

Simplerpath if the worktree command is awkward: in the dev server, enable NERV (type `nerv`) and visually compare against the live site `https://liam-sango.github.io/002/` (which is current `main`). Confirm NERV mode is identical: green readout palette, scanlines + CRT flicker, body grid + vignette, notched panels + corner brackets, hazard stripe on the hero, kanji watermark, blinking caret, synchro gauges, uppercase Chakra Petch, boot sequence on enable, and the full HUD (corner reticles, telemetry clock/sync, side labels, MAGI side panels, market ticker). Clean up any temp worktree: `git worktree remove /tmp/nerv-ref` (and `git stash pop` if you stashed).

- [ ] **Step 5: Persistence + easter-egg behavior**

- Toggle light/dark, reload → choice persists. Open a new tab → still your choice (localStorage).
- Enable NERV, reload same tab → NERV persists (sessionStorage); open a **new** tab → resets to the professional theme.
- Type `nerv` while focused in the blog search box → does **not** toggle.
- Footer glyph and keyword stay in sync.

- [ ] **Step 6: Reduced motion + responsive**

- With `prefers-reduced-motion: reduce` (DevTools rendering emulation), enable NERV → no boot animation/flicker.
- Resize to mobile width → nav, hero, cards, timeline reflow cleanly in professional light/dark and in NERV.

- [ ] **Step 7: Fix anything the matrix surfaced, then final commit**

If any check failed, fix it (most likely a missed selector in a `[data-nerv]` re-scope, or a stray `var(--accent-glow)` in a base rule), rebuild, and:

```bash
git add -A
git commit -m "Fix issues found in verification matrix"
```

(If nothing failed, skip the commit.)

---

## Self-Review notes (for the implementer)

- **Spec coverage:** every spec section maps to a task — tokens/palette/type/shape (Tasks 5–8), accent-as-signal (enforced across 6–8 + verified in 12 Step 2), two-axis architecture + hooks + pre-paint (Tasks 1–5), NavBar indices + toggle (9), footer glyph (10), status line + decorative-hide (11 + 6), NERV parity (6–8 re-scope + 12 Step 4), persistence/edge cases/reduced-motion/responsive (12).
- **NERV parity is mechanical:** the `html[data-nerv]` rules are the *current* rules, prefixed — don't hand-rewrite them; copy from `git show HEAD:src/app/globals.css`.
- **If a base rule references a NERV-only var** (`--accent-glow`, `--accent-bright`, `--grid`, `--red`): it shouldn't, after the rewrites. If you spot one, it belongs in the `[data-nerv]` copy, not the base.
- **HUD / boot / side-panel rules are already effectively NERV-scoped — leave them as-is.** The CSS blocks for `.hud*`, `.boot*`, `.magi*`, `.tk-*`, and `.hud-panel*` (roughly the second half of `globals.css`) only ever apply when `Hud`/`BootSequence` are mounted, and those components mount **only** in NERV mode (`NervLayer` renders them only when `enabled`). So Tasks 6–8 do **not** need to touch or re-scope them — they keep using the NERV-valued variables (`--accent`, `--accent-glow`, etc.), which resolve correctly because `data-nerv` is present whenever they render. Re-scoping them under `html[data-nerv]` would be harmless but unnecessary churn; skip it. The only HUD-adjacent rules that *do* move (already covered in Task 5) are the page-level `html::after` scanlines and `body::before/::after` grid/vignette, because those attach to the page chrome, not the HUD components.
- **Variable-name migration:** the current stylesheet's NERV palette currently lives in `:root`; after Task 5 those same values live under `html[data-nerv]`. Because the HUD/boot rules reference them as plain `var(--accent)` etc. (not hard-coded hex), they pick up the `[data-nerv]` values automatically — no edit needed. This is why the mechanical re-scope preserves parity.
