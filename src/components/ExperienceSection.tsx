import experience from "@/data/experience";

export default function ExperienceSection() {
  return (
    <section className="glass-card section" aria-labelledby="experience-heading">
      <span className="section-eyebrow">03 — Experience</span>
      <h2 id="experience-heading" className="section-heading">
        Where I&apos;ve Worked
      </h2>
      <p className="section-intro">
        A few of the roles that shaped how I build software.
      </p>

      <div className="timeline">
        {experience.map((job) => (
          <article key={job.id} className="timeline-item">
            <div className="timeline-head">
              <div>
                <span className="timeline-role">{job.role}</span>{" "}
                <span className="timeline-company">@ {job.company}</span>
              </div>
              <span className="timeline-period">
                {job.start} — {job.end}
                {job.location ? ` · ${job.location}` : ""}
              </span>
            </div>
            <ul className="timeline-bullets">
              {job.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
