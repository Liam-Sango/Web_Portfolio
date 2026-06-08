# 002 — Liam Sango's Portfolio

A modern, dark-glass portfolio and resume site, built with Next.js and deployed on GitHub Pages. Clean and professional by default — with a hidden **NERV mode** easter egg for anyone who knows the magic word.

**Live:** **[liam-sango.github.io/002](https://liam-sango.github.io/002/)**

![Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![Stack](https://img.shields.io/badge/React-19-blue?logo=react) ![Stack](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![License](https://img.shields.io/badge/license-MIT-green)

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production (static export to /out)
npm run build
```

Open **[http://localhost:3000/002](http://localhost:3000/002)** in your browser — the app is served under the `/002` base path, so the bare `/` will 404. The site hot-reloads on save.

## NERV mode (easter egg)

By default the site is a clean, professional dark-glass portfolio. Type **`nerv`** (case-insensitive) anywhere on the page to toggle an Evangelion-inspired **NERV layer**: a boot-sequence animation plus a HUD overlay (live clock, sync-ratio readout, market ticker, and side panels). Type `nerv` again to switch it back off.

- The preference is stored **per session** (`sessionStorage`): it survives same-tab reloads but resets in a new tab or fresh browser.
- Typing inside a form field (e.g. the blog search box) won't trigger it, and the boot animation respects `prefers-reduced-motion`.
- Implementation: [`useKeySequence`](src/lib/useKeySequence.ts) detects the typed word; [`NervLayer`](src/components/NervLayer.tsx) gates the boot + HUD behind it.

## Deploy

Push to `main` — the [GitHub Actions workflow](.github/workflows/deploy.yml) builds and publishes to GitHub Pages automatically. The site exports as a static bundle in `out/`.

- **Live URL:** https://liam-sango.github.io/002/
- Everything is served under the `/002` base path (`basePath` in [`next.config.ts`](next.config.ts)).
- The export is **directory-style** (`trailingSlash: true`), so clean URLs like `/projects/lumen-analytics` resolve on GitHub Pages and other strict static hosts without a `.html` extension.

## Live market ticker (optional)

The NERV HUD's bottom ticker can show live stock quotes via [Finnhub](https://finnhub.io/) (free tier). Without a key it falls back to flavor readouts.

- **Local:** copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_FINNHUB_KEY`.
- **Production:** add a repo secret named `FINNHUB_KEY`; the deploy workflow forwards it at build time.

> This is a `NEXT_PUBLIC_` var, so the key is inlined into the public static bundle — use only a free, rate-limited key.

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── globals.css           # Global styles + dark-glass design system
│   │   ├── layout.tsx            # Root layout, metadata, fonts, mounts <NervLayer/>
│   │   ├── page.tsx              # Home — composes all sections
│   │   ├── projects/[slug]/      # Per-project detail pages (statically generated)
│   │   └── blog/[slug]/          # Per-post detail pages (statically generated)
│   ├── components/
│   │   ├── NavBar.tsx            # Sticky glass nav with brand + tab switching
│   │   ├── HeroSection.tsx       # Landing intro with CTAs
│   │   ├── AboutSection.tsx      # Bio + resume download
│   │   ├── SkillsSection.tsx     # Grouped tech/skill badges
│   │   ├── ExperienceSection.tsx # Work-history timeline
│   │   ├── ProjectsSection.tsx   # Project cards linking to detail pages
│   │   ├── BlogSection.tsx       # Searchable/filterable blog post list
│   │   ├── ContactSection.tsx    # Email + social contact tiles
│   │   ├── Footer.tsx            # Site footer
│   │   ├── NervLayer.tsx         # Gates NERV boot + HUD behind the `nerv` keygate
│   │   ├── BootSequence.tsx      # NERV-mode boot animation
│   │   ├── Hud.tsx               # NERV-mode HUD overlay (clock, sync readout)
│   │   ├── SidePanels.tsx        # NERV-mode side readout panels
│   │   └── StockTicker.tsx       # Live market ticker (Finnhub)
│   ├── lib/
│   │   ├── useKeySequence.ts     # Typed key-sequence detector (powers the keygate)
│   │   ├── useMarketFeed.ts      # Live market-quote hook (Finnhub)
│   │   ├── marketViz.ts          # Market data → HUD readout helpers
│   │   ├── basePath.ts           # basePath constant + asset() link helper
│   │   └── site.ts              # Socials + date-formatting helpers
│   └── data/
│       ├── projects.ts          # Project entries (edit to add yours)
│       ├── blog.ts             # Blog posts + filter/search helpers
│       ├── skills.ts            # Grouped skills
│       └── experience.ts        # Work history
├── public/                      # Static assets (resume.pdf, favicon, etc.)
├── .github/workflows/           # CI/CD for GitHub Pages
├── next.config.ts               # Static export, basePath /002, trailingSlash
└── out/                         # Static export output (generated by build)
```

## Adding Content

### Projects

Edit `src/data/projects.ts` — each entry follows this shape and gets its own detail page at `/projects/<id>`:

```ts
{
  id: "my-project",
  title: "My Project",
  description: "Short summary shown on the project card.",
  tech: ["TypeScript", "React", "Node.js"],
  github: "https://github.com/Liam-Sango/my-project",
  liveUrl: "https://my-project.example.com",  // optional
  date: "2026-06-01",
  content: "<p>Full case-study HTML for the project's detail page.</p>",
}
```

### Blog Posts

Edit `src/data/blog.ts` — each post gets its own page at `/blog/<id>`:

```ts
{
  id: "post-slug",
  title: "Post Title",
  excerpt: "Short summary shown in the list.",
  tags: ["tech", "tutorial"],
  date: "2026-06-01",
  content: "<p>HTML-rendered post body for the detail page.</p>",
}
```

Posts are filterable by tag and searchable by title/excerpt.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, static export) |
| Routing | Static export with directory-style clean URLs (`trailingSlash`) |
| Styling | Custom CSS design system — dark glassmorphism, CSS custom properties, gradient accents |
| Fonts | [Inter](https://rsms.me/inter/) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) via `next/font` |
| Language | TypeScript |
| Hosting | GitHub Pages (served under `/002`) |

## License

MIT — see [LICENSE](LICENSE).

## AI Disclosure

This project is developed with AI assistance. See [AI_DISCLOSURE.md](AI_DISCLOSURE.md) for details.
