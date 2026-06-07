import projects from "@/data/projects";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
  });
}

export default function ProjectsSection() {
  return (
    <section className="glass-card section" aria-labelledby="projects-heading">
      <span className="section-eyebrow">04 — Projects</span>
      <h2 id="projects-heading" className="section-heading">
        Things I&apos;ve Built
      </h2>
      <p className="section-intro">
        A selection of projects I&apos;ve designed and shipped. Each one taught
        me something I carried into the next.
      </p>

      {projects.length === 0 ? (
        <p className="empty-state">Projects coming soon.</p>
      ) : (
        <div className="card-grid">
          {projects.map((project) => (
            <article key={project.id} className="project-card">
              <div>
                <h3>{project.title}</h3>
                <p className="card-meta">{formatDate(project.date)}</p>
              </div>
              <p>{project.description}</p>
              <div className="badge-row">
                {project.tech.map((t) => (
                  <span key={t} className="badge">
                    {t}
                  </span>
                ))}
              </div>
              <div className="card-links">
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
