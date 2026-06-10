# Visual Overhaul: "Graphite & Phosphor" Default + Light/Dark + NERV as a Skin — Design Spec

**Date:** 2026-06-10
**Status:** Approved (design); pending spec review

## Summary

Replace the site's always-on Evangelion/NERV cyberpunk skin as the *default*
with a distinctive, professional theme — **"Graphite & Phosphor"** — that ships
in **both light and dark**. The full NERV cyberpunk identity (green readout
palette, scanlines, CRT flicker, hazard stripes, uppercase angular type, kanji,
clip-path notches, boot sequence, HUD overlays) is relegated to a hidden,
opt-in **skin** that sits on top of whichever light/dark theme is active.

This supersedes the visual direction of the prior approved spec
(`2026-06-09-nerv-activatable-mode-design.md`), which named the clean default
"Slate Professional" = GitHub-dark `#0d1117` + blue `#3b82f6` + Inter. That
direction is itself a canonical generic-AI look; this spec keeps that spec's
*architecture* (root-class/attribute theme swap, shared state hooks, footer NERV
toggle, persistence) but replaces the aesthetic with Graphite & Phosphor and
adds a real light/dark axis.

The overhaul is a **reskin plus a small set of targeted markup details** — no
section is removed, no content rewritten, no layout reflowed. NERV mode, when
enabled, remains **pixel-identical to the current `main` site.**

## Motivation

The portfolio is shared in professional contexts (recruiters, applications).
The current site reads as a themed, "vibecoded" cyberpunk site rather than the
work of a senior, design-literate engineer. The owner explicitly asked to make
it "look less vibecoded," to keep the existing cyberpunk look as an optional
NERV easter-egg toggle, and to use a high-quality frontend aesthetic for the new
default.

Graphite & Phosphor was chosen (over editorial/Swiss/warm-humane alternatives)
during a visual brainstorm: it keeps the technical/security identity the site
already projects, but dials it from costume to credential — a "grown-up
terminal," not a hacker movie. It reads unmistakably as cybersecurity without
the neon-hacker cliché, and is fully WCAG-AA clean in both light and dark.

## Theme Direction: Graphite & Phosphor

A near-monochrome warm-graphite system with a single, scarce phosphor-green
signal accent used like an indicator LED — it only "lights" on interaction or
genuine live status. References: IBM Plex specimen pages, man-page/RFC
typesetting, the personal sites of security researchers (Valsorda, jvns), and
calm lab-instrument panels rather than neon HUDs.

### Palette (CSS variables)

| Token | Dark | Light |
|---|---|---|
| `--bg` | `#14161a` | `#f4f3ee` |
| `--bg-2` | `#101216` (subtle) | `#eeece4` (subtle) |
| `--panel` | `#1b1e23` | `#fbfaf6` |
| `--panel-2` | `#202329` | `#f3f1ea` |
| `--text` | `#e7e6e1` | `#1b1d1f` |
| `--muted` | `#9aa0a3` | `#5c5f63` |
| `--border` | `#2a2e34` | `#dcd9cf` |
| `--accent` | `#5fae86` | `#2f7d57` |
| `--accent-hover` | `#74c79b` | `#266546` |

(`--bg-2` / `--panel-2` are minor steps used for subtle elevation/zebra; exact
values may be nudged during implementation but stay within the family.)

Both accents pass WCAG AA for normal text (dark `#5fae86` ≈ 6.8:1 on `--bg`;
light `#2f7d57` ≈ 4.5:1 on `--bg`). The light accent is borderline at 4.5:1, so
**primary-button label contrast must be verified**: a solid-accent button uses a
background-colored (not white) label, or the darker `--accent-hover` fill, so
the label clears AA. The accent never carries long-form reading text.

### Accent-as-signal rule (enforced in code)

Phosphor green is rationed. **It MAY appear on:** inline link text + link
underline; the active nav-tab label and index; the 2px left-edge rule on a
hovered/active card, blog row, contact tile, or timeline item; section-index
carets/eyebrow ticks; one "available" status dot (steady, non-blinking);
`focus-visible` outlines; `::selection`; and the single primary button per view
(the one place it fills). **It MUST NOT appear on:** body text, headings, large
fills or backgrounds, card backgrounds, glows/box-shadows, gradients, hazard
stripes, or more than ~one accent element per visual cluster. Resting state of
the whole page is monochrome graphite.

### Type

- **Headings:** Space Grotesk, sentence case (no forced uppercase), weight
  500–600, tight tracking (−0.02em), tight leading (~1.05) at large sizes.
- **Body:** IBM Plex Sans, 400, ~1.65 line-height, generous measure (~68ch).
- **Mono:** IBM Plex Mono for all metadata — eyebrows, section indices, dates,
  tags, nav numbers, status line — small (0.72–0.78rem), ~0.08em tracking;
  UPPERCASE reserved strictly for tiny labels/eyebrows, never headings or body.
- **Signature move:** the case contrast — sentence-case grotesk headings vs.
  uppercase mono micro-labels.

### Shape

- A single radius: **4px** everywhere (never pill, never 2xl/16px).
- Borders strictly **1px hairlines** in `--border`; **zero drop shadows, zero
  glows** in the professional theme.
- Recurring device is the **rule, not the box**: full-width hairline rules
  separate sections like a typeset document; each card/list item carries a 1px
  neutral left edge that thickens to a **2px `--accent` rule on hover/active**.
- Badges/tags are **outlined** (1px border, transparent fill, 4px radius), never
  solid pills.

## Architecture

Two **independent axes**, each a root-level attribute on `<html>`, owned by one
hook:

- **Axis 1 — color scheme:** `data-theme="light" | "dark"`, owned by
  `useTheme`. Default = system preference; user choice persists in localStorage.
- **Axis 2 — skin:** `data-nerv` present/absent, owned by `useNervMode`.
  Default off; toggled by the `nerv` keyword or footer glyph; persists in
  sessionStorage (per-session easter egg).

The axes are orthogonal: NERV is a skin that overrides on top, not a third color
scheme. When `data-nerv` is present it wins the cascade regardless of
`data-theme`.

### `globals.css` — three layers (major, mechanical restructure)

1. **Base / structural layer:** layout, type scale, shape language, and all
   component rules written against CSS variables (theme-agnostic). This is the
   Graphite & Phosphor structure: 4px radius, 1px hairlines, hairline section
   rules, outlined chips, accent left-rule interaction, no shadows/glows.
2. **Palette layer:** both schemes are written as **explicit selectors** —
   `[data-theme="dark"]` and `[data-theme="light"]` — each carrying its full
   variable set (table above). `:root` holds the dark set as a safety fallback
   so the page is themed even if the attribute is somehow absent, but the
   inline head script always sets `data-theme` to one explicit value before
   paint. (Explicit-both, rather than "dark base + light override," keeps the
   head script and the toggle symmetric.)
3. **NERV layer:** everything scoped under `html[data-nerv]` — the current
   stylesheet's NERV palette overrides (`--accent:#2bff88`, `--notch:14px`,
   `--radius:0`), scanlines/CRT flicker (`html[data-nerv]::after`), body grid +
   vignette (`body` under `[data-nerv]`), notched clip-paths, corner brackets,
   glows, hazard stripes, kanji, caret, hero gauges, uppercase/letter-spacing
   treatments, Chakra Petch/Saira application, and all boot/HUD/side-panel
   styling. Re-scoping the existing rules under `[data-nerv]` must reproduce
   today's look exactly. Existing `prefers-reduced-motion` and responsive media
   queries are preserved.

Decorative NERV-only elements that live in shared markup (kanji watermark,
blinking caret, the two SYNCHRO-RATIO gauges) are **hidden via CSS** in the base
layer and reappear under `[data-nerv]` — no markup removal.

### New: `src/lib/useTheme.ts`

- Owns the `light | dark` value; applies `data-theme` on
  `document.documentElement`.
- On mount, resolves initial value: localStorage key `theme` if present, else
  `window.matchMedia("(prefers-color-scheme: dark)")`.
- Exposes current value + `toggle()` / `setTheme()`.
- Writes choice to localStorage (try/catch) on change.
- Optionally listens to `matchMedia` changes while the user hasn't made an
  explicit choice (nice-to-have; implementation plan decides).
- Shared across consumers (nav toggle now; extensible later) via a small
  module-level store / `useSyncExternalStore` so all consumers stay in sync.

### New: `src/lib/useNervMode.ts`

- Owns the NERV on/off boolean; applies/removes `data-nerv` on
  `document.documentElement`.
- Default `false` (SSR-safe; first render false, hydrate via effect → no
  hydration mismatch).
- On mount, reads sessionStorage key `nerv-mode` (`"1"` → enabled).
- Exposes value + `toggle()`. Writes/removes sessionStorage on change
  (try/catch).
- Shared store so the `nerv` keyword listener and the footer glyph drive one
  source of truth.

### New: inline pre-paint theme script (in `layout.tsx` `<head>`)

A tiny synchronous inline `<script>` reads localStorage `theme` (or system
preference) and sets `data-theme` on `<html>` **before first paint**, preventing
a light/dark flash. It does **not** touch `data-nerv` (NERV stays SSR-default
off and only mounts post-hydration, as today). Must be inlined (not a module) to
run before paint in a static export.

### Changed: `src/components/NavBar.tsx`

- Becomes/stays a client component. Add a **two-digit mono index** prefix to
  each tab label: `01 About · 02 Skills · 03 Experience · 04 Projects ·
  05 Blog · 06 Contact`. Index is a small mono span; label keeps the body face.
  Active tab uses the accent on label + index.
- Add a small **light/dark toggle button** (sun/moon or minimal two-state
  glyph), `aria-label="Toggle light/dark theme"`, calling `useTheme().toggle()`.
  This is the only new interactive element in the nav.
- No change to routing/hash behavior.

### Changed: `src/components/Footer.tsx`

- Add one **subtle NERV toggle glyph** (small button, e.g. a tiny hex or "NERV"
  marker), `aria-label="Toggle NERV mode"`, calling `useNervMode().toggle()`.
  Unobtrusive in the professional theme, on-brand under NERV.
- Footer becomes a client component, or the glyph is a small client child so the
  rest stays server-rendered (implementation plan decides). `new Date()` year
  usage is preserved.

### Changed: `src/components/NervLayer.tsx`

- Drop local `useState`/sessionStorage; consume `useNervMode()`.
- Keep `useKeySequence("nerv", toggle)`.
- Keep rendering `enabled && (<><BootSequence /><Hud /></>)`.
- No longer owns the root attribute (the hook does) — avoid double-ownership.

### Changed: `src/app/layout.tsx`

- Add the inline pre-paint theme script in `<head>`.
- **Fonts:** add Space Grotesk (headings), IBM Plex Sans (body), IBM Plex Mono
  (professional mono) via `next/font/google`; **keep Chakra Petch + Saira +
  JetBrains Mono loaded for NERV**, since NERV must stay pixel-identical to
  current `main` (its mono is JetBrains Mono). Wire CSS variables so the base
  layer resolves `--font-display`/`--font-body`/mono to the Space Grotesk + IBM
  Plex Sans + IBM Plex Mono trio, and the `[data-nerv]` layer overrides them
  back to Chakra Petch / Saira / JetBrains Mono. Net: five families load (three
  professional + the two NERV display/body faces + JetBrains Mono). If the
  implementation finds IBM Plex Mono and JetBrains Mono visually
  interchangeable, it MAY collapse to one mono for both — but the default is to
  preserve NERV's exact face.
- Continues to mount `<NervLayer />`, `<NavBar />`, `{children}`, `<Footer />`.
- The favicon may be updated to suit the professional default, or left as-is
  (out of scope unless trivial; plan decides).

### Signature-detail restyling (CSS over existing markup)

- **Section masthead rhythm:** mono eyebrow over a full-width hairline rule,
  heading below — replaces the `▶`-prefixed uppercase eyebrow and glowing
  heading. (`.section-eyebrow`, `.section-heading`.)
- **Status line:** the hero meta strip (`.hero-meta`) restyled to a calm mono
  status line (e.g. `AVAILABLE · REMOTE AU · LAST UPDATED 2026.06`) with one
  steady green dot. Minor content tweak in `HeroSection.tsx`; no structural
  change.
- **Ledger-aligned dates:** timeline + card/post dates use tabular mono
  (`font-variant-numeric: tabular-nums`) to align vertically; timeline hex node
  simplified to a small square/tick in the base (hex returns under NERV).
- **Accent left-rule:** applied to `.project-card`, `.blog-post`,
  `.contact-tile`, `.timeline-item` in the base layer.

### Unchanged

`BootSequence`, `Hud`, `SidePanels`, `StockTicker`, `useKeySequence`,
`useMarketFeed`, `marketViz`, `basePath`, `site`, all `data/*`, section
component **structure/markup** (beyond the small status-line text tweak and nav
indices), routing, and the static-export config.

## Data Flow

1. **Pre-paint:** inline head script sets `data-theme` on `<html>` from
   localStorage or system preference — first paint is already correctly
   light/dark, no flash.
2. **Hydration:** `useTheme` reads the same source and syncs its store to the
   already-applied attribute (no change, no flash). `useNervMode` initializes
   `false`; an effect reads sessionStorage and may add `data-nerv` (boot replays
   on enable, as today).
3. **Light/dark toggle (nav):** `useTheme().toggle()` flips the value, updates
   `data-theme`, writes localStorage. CSS variables swap; the whole page
   re-themes.
4. **NERV toggle (keyword in `NervLayer` or footer glyph):** both call the
   shared `useNervMode().toggle()`, which flips `data-nerv` and updates
   sessionStorage. The NERV layer wins the cascade; `BootSequence` + `Hud` mount
   while enabled.
5. The two axes never interfere: removing `data-nerv` returns to whatever
   `data-theme` is active.

## Edge Cases

- **No light/dark FOUC:** the inline pre-paint script applies `data-theme`
  before first paint. Because the value derives from localStorage/system (stable
  between server and the script), there is no flash and no hydration mismatch on
  the attribute.
- **No NERV flash:** `data-nerv` is never set server-side; NERV only applies
  post-hydration via effect/keystroke. Fresh loads never flash green.
- **System theme with no stored choice:** first visit follows
  `prefers-color-scheme`; once the user toggles, the stored choice wins on
  return visits.
- **localStorage/sessionStorage unavailable:** try/catch around all storage; the
  feature works in-memory for the page view, just not persisted.
- **Decorative NERV elements:** kanji watermark, caret, synchro gauges are
  `aria-hidden` decoration; hidden via CSS in the base, shown under
  `[data-nerv]`. No markup change.
- **Blog search / form fields:** the `nerv` keyword listener still ignores
  editable targets and modifier keys (unchanged `useKeySequence`).
- **Reduced motion:** NERV effects and the boot animation still respect
  `prefers-reduced-motion` (unchanged). The professional theme has no motion of
  concern.
- **Light-mode accent contrast:** primary-button labels must be verified against
  AA (use bg-colored label or `--accent-hover` fill); accent never used for
  small icon-only sub-18px text on light bg.
- **Both NERV controls in sync:** keyword and footer glyph share one state.

## Testing

No test runner is wired up; verification is proportionate and manual, plus a
build check.

- `npm run build` (static export) succeeds.
- **Default (no stored choice):** fresh load follows system light/dark; shows
  Graphite & Phosphor — warm graphite/paper, sentence-case Space Grotesk
  headings, hairline rules, outlined chips, accent only on links/active/hover,
  no scanlines/CRT/grid/glows/kanji/boot/HUD.
- **Light/dark toggle:** nav toggle flips the scheme; choice persists across a
  reload and a new tab (localStorage).
- **Accent scarcity:** spot-check each section — no more than ~one accent
  element per visual cluster; resting page is monochrome.
- **AA contrast:** verify text and primary-button labels in both schemes
  (esp. light-mode accent button).
- **NERV via keyword:** typing `nerv` plays the boot sequence and applies the
  full NERV skin + HUD, **pixel-identical to current `main`**, on top of either
  light or dark. Typing `nerv` again returns to the professional theme.
- **NERV via footer glyph:** clicking toggles the same state; stays in sync with
  the keyword.
- **NERV persistence:** same-tab reload preserves NERV; a new tab resets to the
  professional theme (sessionStorage).
- **Editable fields:** typing "nerv" in the blog search box does not toggle.
- **Reduced motion:** NERV without the boot animation.
- **Responsive:** mobile/tablet breakpoints intact in light, dark, and NERV.

## Execution Plan (ultracode)

Work is delegated across parallel agents with synthesis and an adversarial
verification pass:

- **Agent A — base + palette CSS:** author the Graphite & Phosphor base/
  structural layer and both `[data-theme]` palette sets; implement the signature
  restyling (section masthead, accent left-rule, outlined chips, ledger dates,
  status line) over existing class names.
- **Agent B — NERV re-scope:** move all existing NERV styling under
  `html[data-nerv]`, targeting pixel-parity with today; ensure decorative
  elements hide in base and return under NERV.
- **Agent C — state + components:** `useTheme` + `useNervMode` hooks, inline
  pre-paint script, `NavBar` (mono indices + light/dark toggle), `Footer` (NERV
  glyph), `NervLayer` refactor, `layout.tsx` font wiring, `HeroSection`
  status-line text tweak.
- **Synthesis:** merge into `globals.css`/components; resolve cascade conflicts
  (base vs. `[data-theme]` vs. `[data-nerv]` specificity).
- **Agent D — adversarial verify:** `npm run build`; confirm default follows
  system + has zero NERV artifacts; confirm light/dark toggle + persistence;
  confirm NERV matches current `main` over both schemes; check AA contrast,
  accent scarcity, reduced-motion, and responsive paths.

## Out of Scope

- Any change to UI **structure or layout** beyond the listed signature details
  (nav indices, accent left-rule, masthead rhythm, status-line text, ledger
  dates, nav toggle, footer glyph). No section is added/removed; no component is
  structurally redesigned.
- Changes to NERV's own visuals (must remain identical to current `main`).
- Changes to `Hud` / `SidePanels` / `StockTicker` / `BootSequence` rendering or
  to the live market feed.
- A nav-bar NERV toggle or making NERV a visible third mode (NERV stays a hidden
  easter egg: keyword + footer glyph only).
- A configurable/user-customizable key sequence.
- A third "auto/system" UI control beyond the initial default (the toggle is a
  simple light⇄dark; system preference only seeds the first visit).
- Cross-session persistence for NERV (per-session is intentional).
- Adding a test harness / unit tests (no runner today; YAGNI).
