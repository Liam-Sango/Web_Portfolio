export interface Experience {
  id: string;
  company: string;
  role: string;
  start: string; // e.g. "2024"
  end: string; // e.g. "Present"
  location?: string;
  bullets: string[];
}

// ─────────────────────────────────────────────────────────────
// Sample data — replace with your real work history.
// Ordered newest-first.
// ─────────────────────────────────────────────────────────────
const experience: Experience[] = [
  {
    id: "northwind",
    company: "Northwind Labs",
    role: "Senior Full-Stack Engineer",
    start: "2024",
    end: "Present",
    location: "Remote",
    bullets: [
      "Lead the front-end architecture for a real-time analytics product serving thousands of daily active users.",
      "Cut p95 dashboard load time by 60% by moving aggregation into a columnar query layer.",
      "Mentor two engineers and run the team's architecture review process.",
    ],
  },
  {
    id: "verdant",
    company: "Verdant Studio",
    role: "Full-Stack Engineer",
    start: "2021",
    end: "2024",
    location: "Sydney, AU",
    bullets: [
      "Shipped the company's flagship headless CMS from prototype to production.",
      "Designed the relational data model and REST API powering content delivery.",
      "Drove adoption of a typed component library that halved UI regression bugs.",
    ],
  },
  {
    id: "embed-co",
    company: "EmbedCo",
    role: "Software Engineer",
    start: "2019",
    end: "2021",
    location: "Melbourne, AU",
    bullets: [
      "Built firmware and desktop tooling for resource-constrained embedded devices.",
      "Wrote a memory-conscious data pipeline that ran on under 64KB of RAM.",
      "Bridged the gap between hardware and product teams during launch cycles.",
    ],
  },
];

export default experience;
