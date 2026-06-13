import Link from "next/link";
import projects, { type Project } from "@/data/projects";
import { formatMonth } from "@/lib/site";

function ProjectCard({ project }: { project: Project }) {
  const inProgress = project.status === "in-progress";
  return (
    <article className="project-card">
      <div>
        <div className="project-card-head">
          <h3>{project.title}</h3>
          {inProgress && <span className="project-status">In progress</span>}
        </div>
        <p className="card-meta">{formatMonth(project.date)}</p>
      </div>
      {project.description && <p>{project.description}</p>}
      <div className="badge-row">
        {project.tech.map((t) => (
          <span key={t} className="badge">
            {t}
          </span>
        ))}
      </div>
      <div className="card-links">
        {!inProgress && (
          <Link href={`/projects/${project.id}`} className="btn btn--primary">
            Case study →
          </Link>
        )}
        <a
          href={project.github}
          className={`btn ${inProgress ? "btn--primary" : "btn--ghost"}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            className="btn btn--ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            Live ↗
          </a>
        )}
      </div>
    </article>
  );
}

export default function ProjectsSection() {
  const shipped = projects.filter((p) => p.status !== "in-progress");
  const inProgress = projects.filter((p) => p.status === "in-progress");

  return (
    <section className="glass-card section" aria-labelledby="projects-heading">
      <span className="section-eyebrow">04 — Projects</span>
      <h2 id="projects-heading" className="section-heading">
        Things I&apos;ve Built
      </h2>
      <p className="section-intro">
        A mix of coursework, small tools, and things I build to learn. Each one
        taught me something I carried into the next.
      </p>

      {shipped.length > 0 && (
        <div className="card-grid">
          {shipped.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {inProgress.length > 0 && (
        <>
          <h3 className="group-heading">In Progress</h3>
          <div className="card-grid">
            {inProgress.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
