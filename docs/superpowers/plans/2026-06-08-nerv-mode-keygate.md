# NERV Mode Key Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the NERV boot sequence and HUD overlay by default; reveal them only when the visitor types the secret key sequence `nerv` (typing it again hides them), persisted per browser session.

**Architecture:** A single client component (`NervLayer`) owns the on/off state, persists it to sessionStorage, and conditionally renders `<BootSequence />` and `<Hud />`. Key-sequence detection is extracted into a reusable `useKeySequence` hook. `layout.tsx` mounts `NervLayer` instead of mounting `Hud`/`BootSequence` directly. `BootSequence` loses its one-per-session guard so it replays on each enable.

**Tech Stack:** Next.js 15 (App Router, static export), React 19, TypeScript 5. No test runner is configured — verification is via `npm run build`, `npm run lint`, and a manual browser checklist.

---

## File Structure

- **Create** `src/lib/useKeySequence.ts` — reusable hook: detects a typed character sequence, ignores editable targets and modifier keys.
- **Create** `src/components/NervLayer.tsx` — client component: owns `enabled` state + sessionStorage persistence, wires the hook, conditionally renders `BootSequence` + `Hud`.
- **Modify** `src/components/BootSequence.tsx` — remove the `nerv-booted` session guard so boot plays on every mount.
- **Modify** `src/app/layout.tsx` — replace direct `<Hud />` / `<BootSequence />` mounts with `<NervLayer />`.

---

## Task 1: `useKeySequence` hook

**Files:**
- Create: `src/lib/useKeySequence.ts`

- [ ] **Step 1: Create the hook**

Create `src/lib/useKeySequence.ts` with exactly this content:

```ts
"use client";

import { useEffect, useRef } from "react";

// Fires `onMatch` when the user types `target` (case-insensitive) on the
// keyboard. Ignores keystrokes while focus is in an editable field (so the
// blog search box can't trigger it) and ignores keypresses with a modifier
// held. Buffer is kept in a ref so the listener identity stays stable.
export function useKeySequence(target: string, onMatch: () => void): void {
  const buffer = useRef("");
  const handler = useRef(onMatch);
  handler.current = onMatch;

  useEffect(() => {
    const want = target.toLowerCase();

    function isEditable(el: EventTarget | null): boolean {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1) return; // ignore Enter, arrows, etc.
      if (isEditable(e.target)) return;

      const next = (buffer.current + e.key.toLowerCase()).slice(-want.length);
      buffer.current = next;
      if (next === want) {
        buffer.current = "";
        handler.current();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [target]);
}
```

- [ ] **Step 2: Type-check / lint**

Run: `npm run lint`
Expected: no errors referencing `useKeySequence.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/useKeySequence.ts
git commit -m "Add useKeySequence hook for typed key-sequence detection"
```

---

## Task 2: `NervLayer` component

**Files:**
- Create: `src/components/NervLayer.tsx`

Depends on Task 1 (`useKeySequence`). `BootSequence` and `Hud` already exist and are imported as-is.

- [ ] **Step 1: Create the component**

Create `src/components/NervLayer.tsx` with exactly this content:

```tsx
"use client";

import { useEffect, useState } from "react";
import BootSequence from "@/components/BootSequence";
import Hud from "@/components/Hud";
import { useKeySequence } from "@/lib/useKeySequence";

// Gate for the NERV "flavor" layers. Default is a clean professional
// portfolio; typing `nerv` toggles the boot sequence + HUD overlay on/off.
// State lives in sessionStorage so it survives same-tab reloads but resets in
// a new tab / fresh browser.
const STORAGE_KEY = "nerv-mode";

export default function NervLayer() {
  // Always false on first render so server and client markup match; an effect
  // re-enables after mount if this session previously turned it on.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") setEnabled(true);
    } catch {
      /* sessionStorage unavailable — stay disabled */
    }
  }, []);

  useKeySequence("nerv", () => {
    setEnabled((on) => {
      const next = !on;
      try {
        if (next) sessionStorage.setItem(STORAGE_KEY, "1");
        else sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return next;
    });
  });

  if (!enabled) return null;

  return (
    <>
      <BootSequence />
      <Hud />
    </>
  );
}
```

- [ ] **Step 2: Type-check / lint**

Run: `npm run lint`
Expected: no errors referencing `NervLayer.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/NervLayer.tsx
git commit -m "Add NervLayer to gate boot + HUD behind nerv key sequence"
```

---

## Task 3: Remove the one-per-session guard from `BootSequence`

**Files:**
- Modify: `src/components/BootSequence.tsx`

The boot must now play every time it mounts (i.e. on each enable), not once per session. Remove the `SESSION_KEY` constant, the `alreadyBooted` read, and the `sessionStorage.setItem` write in `finish`. Keep the reduced-motion skip and click-to-skip.

- [ ] **Step 1: Remove the `SESSION_KEY` constant**

Delete these two lines near the top of `src/components/BootSequence.tsx`:

```tsx
// One boot per browser session — flips to "1" once the sequence has played.
const SESSION_KEY = "nerv-booted";
```

- [ ] **Step 2: Replace the boot-guard block in the mount effect**

Find this block inside the `useEffect`:

```tsx
    let alreadyBooted = false;
    try {
      alreadyBooted = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* sessionStorage unavailable — treat as not booted */
    }

    if (alreadyBooted || reduce) {
      setPhase("hidden");
      return;
    }
```

Replace it with (reduced-motion skip preserved, session guard removed):

```tsx
    if (reduce) {
      setPhase("hidden");
      return;
    }
```

- [ ] **Step 3: Simplify `finish` to drop the sessionStorage write**

Find the `finish` function:

```tsx
  function finish() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setPhase("hidden");
  }
```

Replace it with:

```tsx
  function finish() {
    setPhase("hidden");
  }
```

- [ ] **Step 4: Type-check / lint**

Run: `npm run lint`
Expected: no errors, and no remaining references to `SESSION_KEY` in the file.

- [ ] **Step 5: Verify no dangling references**

Run: `grep -n "nerv-booted\|SESSION_KEY" src/components/BootSequence.tsx`
Expected: no output (both removed).

- [ ] **Step 6: Commit**

```bash
git add src/components/BootSequence.tsx
git commit -m "Drop one-per-session boot guard; boot plays on each mount"
```

---

## Task 4: Mount `NervLayer` in the layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Swap the imports**

In `src/app/layout.tsx`, find:

```tsx
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import BootSequence from "@/components/BootSequence";
import Hud from "@/components/Hud";
import "@/app/globals.css";
```

Replace with:

```tsx
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import NervLayer from "@/components/NervLayer";
import "@/app/globals.css";
```

- [ ] **Step 2: Replace the body mounts**

Find the `<body>` block:

```tsx
      <body>
        <Hud />
        <NavBar />
        {children}
        <Footer />
        <BootSequence />
      </body>
```

Replace with:

```tsx
      <body>
        <NervLayer />
        <NavBar />
        {children}
        <Footer />
      </body>
```

- [ ] **Step 3: Type-check / lint**

Run: `npm run lint`
Expected: no errors; no unused-import warnings for `Hud`/`BootSequence`.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "Mount NervLayer instead of Hud/BootSequence directly"
```

---

## Task 5: Build and manual verification

**Files:** none (verification only).

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build succeeds and static export to `out/` completes with no errors.

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`
Then open `http://localhost:3000`.

- [ ] **Step 3: Manual checklist**

Verify each, in a normal (non-incognito) browser tab:

- [ ] Fresh load → clean portfolio: no boot, no HUD corners/telemetry, no side panels, no stock ticker.
- [ ] Type `nerv` (click empty page area first, then type) → boot sequence plays, then the HUD overlay appears.
- [ ] Type `nerv` again → HUD disappears, back to clean view.
- [ ] With NERV on, reload the same tab → boot replays and HUD returns.
- [ ] Open a new tab to the site → clean default (not enabled).
- [ ] Navigate to the blog, focus the search box, type "nerv" → does **NOT** toggle NERV mode.
- [ ] In OS/browser settings enable "reduce motion", reload, type `nerv` → HUD appears with no boot animation.

- [ ] **Step 4: Final confirmation**

If all checks pass, the feature is complete. No commit needed for this task (verification only). If `npm run build` produced changes (e.g. regenerated `out/`), do not commit generated output unless the repo already tracks it.

---

## Self-Review Notes

- **Spec coverage:** default-hidden (Task 4 mount swap + Task 2 default `false`); enable/disable via `nerv` (Task 1 + 2); sessionStorage per-session (Task 2); boot replays on enable (Task 3); typing-safety in editable fields (Task 1 `isEditable`); modifier-key guard (Task 1); reduced-motion preserved (Task 3 keeps `reduce` skip). All covered.
- **Type consistency:** `useKeySequence(target, onMatch)` defined in Task 1 and called identically in Task 2; sessionStorage keys distinct and intentional (`nerv-mode` for NervLayer in Task 2; `nerv-booted` removed in Task 3).
- **No placeholders:** every code step shows full content.
