export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  github: string;
  liveUrl?: string;
  date: string; // ISO date
}

// ─────────────────────────────────────────────────────────────
// Sample data — replace these with your real projects.
// Each entry follows the `Project` shape above.
// ─────────────────────────────────────────────────────────────
const projects: Project[] = [
  {
    id: "lumen-analytics",
    title: "Lumen Analytics",
    description:
      "A real-time analytics dashboard that ingests event streams and renders sub-second charts. Built around a columnar query layer and a websocket pipeline that keeps thousands of concurrent dashboards in sync without hammering the database.",
    tech: ["TypeScript", "Next.js", "Rust", "ClickHouse", "WebSockets"],
    github: "https://github.com/Liam-Sango/lumen-analytics",
    liveUrl: "https://lumen.example.com",
    date: "2026-04-12",
  },
  {
    id: "driftwood-cms",
    title: "Driftwood CMS",
    description:
      "A git-backed headless CMS for static sites. Editors get a friendly block editor; everything commits straight to a repo as Markdown, so content stays versioned, reviewable, and free of vendor lock-in.",
    tech: ["TypeScript", "React", "Node.js", "PostgreSQL", "Prisma"],
    github: "https://github.com/Liam-Sango/driftwood-cms",
    liveUrl: "https://driftwood.example.com",
    date: "2026-01-28",
  },
  {
    id: "pixelforge",
    title: "PixelForge",
    description:
      "A browser-based sprite editor with onion-skin animation, palette cycling, and one-click export to spritesheets. Runs entirely client-side on a WebGL canvas — no uploads, no accounts, just open and draw.",
    tech: ["TypeScript", "WebGL", "Canvas", "Vite"],
    github: "https://github.com/Liam-Sango/pixelforge",
    date: "2025-10-05",
  },
  {
    id: "harbor-deploy",
    title: "Harbor",
    description:
      "A self-hostable deployment platform that turns any Dockerfile into a zero-downtime rolling deploy with a single command. Includes health-checked rollbacks, per-branch preview environments, and a slim CLI.",
    tech: ["Go", "Docker", "Kubernetes", "gRPC"],
    github: "https://github.com/Liam-Sango/harbor",
    liveUrl: "https://harbor.example.com",
    date: "2025-07-19",
  },
];

export default projects;
