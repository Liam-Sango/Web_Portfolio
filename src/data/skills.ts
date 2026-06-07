export interface SkillGroup {
  category: string;
  items: string[];
}

// ─────────────────────────────────────────────────────────────
// Sample data — replace with your real skill set.
// ─────────────────────────────────────────────────────────────
const skills: SkillGroup[] = [
  {
    category: "Languages",
    items: ["TypeScript", "JavaScript", "Rust", "Go", "Python", "SQL"],
  },
  {
    category: "Frameworks & Libraries",
    items: ["React", "Next.js", "Node.js", "Express", "Prisma", "Tailwind"],
  },
  {
    category: "Data & Infra",
    items: ["PostgreSQL", "ClickHouse", "Redis", "Docker", "Kubernetes", "gRPC"],
  },
  {
    category: "Tools & Practices",
    items: ["Git", "CI/CD", "Testing", "Figma", "Observability", "Accessibility"],
  },
];

export default skills;
