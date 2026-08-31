import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import projects from "@/data/projects";
import { formatMonth } from "@/lib/site";

// Static export: pre-render exactly one page per known project, nothing else.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects
    .filter((project) => project.content)
    .map((project) => ({ slug: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  if (!project) return {};
  return {
    title: `${project.title} — Liam Sango`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  if (!project) notFound();

  return (
    <main>
      <div className="site-container">
        <article className="glass-card article panel-enter">
          <Link href="/#projects" className="back-link">
            ← Back to projects
          </Link>

          <header className="article-header">
            <span className="section-eyebrow">Project</span>
            <h1 className="article-title">{project.title}</h1>
            <div className="article-meta">
              <span>{formatMonth(project.date)}</span>
              <div className="tag-row">
                {project.tech.map((t) => (
                  <span key={t} className="badge">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="btn-row article-links">
              <a
                href={project.github}
                className="btn btn--ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗
              </a>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  className="btn btn--primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live Site ↗
                </a>
              )}
            </div>
          </header>

          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: project.content }}
          />

          <footer className="article-foot">
            <Link href="/#projects" className="back-link">
              ← Back to projects
            </Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
