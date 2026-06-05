import projects from "@/data/projects";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
  });
}

export default function ProjectsSection() {
  if (projects.length === 0) {
    return (
      <section id="projects" className="section" aria-labelledby="projects-heading">
        <div className="site-container">
          <div className="win-window">
            <div className="win-title-bar">
              <span>💾 Projects</span>
              <span>✕</span>
            </div>
            <div className="win-body">
              <h2 id="projects-heading" className="section-title">
                Projects
              </h2>
              <p className="blog-empty">Projects coming soon.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section" aria-labelledby="projects-heading">
      <div className="site-container">
        <div className="win-window">
          <div className="win-title-bar">
            <span>💾 Projects</span>
            <span>✕</span>
          </div>
          <div className="win-body">
            <h2 id="projects-heading" className="section-title">
              Projects
            </h2>

            {projects.map((project) => (
              <article key={project.id} className="win-card">
                <h3>{project.title}</h3>
                <p className="win-card-meta">{formatDate(project.date)}</p>
                <p>{project.description}</p>
                <div className="tech-badges">
                  {project.tech.map((t) => (
                    <span key={t} className="tech-badge">
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <a
                    href={project.github}
                    className="win-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📁 GitHub
                  </a>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      className="win-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🌐 Live Site
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
