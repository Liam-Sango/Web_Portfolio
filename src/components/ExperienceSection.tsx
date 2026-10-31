import experience, { type Experience } from "@/data/experience";

function Timeline({ items }: { items: Experience[] }) {
  return (
    <div className="timeline">
      {items.map((job) => (
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
          {job.bullets.length > 0 && (
            <ul className="timeline-bullets">
              {job.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          )}
          {job.reference && (
            <div className="timeline-reference">
              <span className="reference-label">Reference</span>
              <span className="reference-title">{job.reference.title}</span>
              <span className="reference-withheld">
                Contact withheld, please contact me for details.
              </span>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export default function ExperienceSection() {
  const education = experience.filter((e) => e.kind === "education");
  const work = experience.filter((e) => e.kind === "work");

  return (
    <section className="glass-card section" aria-labelledby="experience-heading">
      <span className="section-eyebrow">03 — Experience</span>
      <h2 id="experience-heading" className="section-heading">
        Education &amp; Experience
      </h2>
      <p className="section-intro">
        Where I&apos;m studying and the experience I&apos;ve picked up along the
        way.
      </p>

      {education.length > 0 && (
        <>
          <h3 className="group-heading">Education</h3>
          <Timeline items={education} />
        </>
      )}

      {work.length > 0 && (
        <>
          <h3 className="group-heading">Professional Experience</h3>
          <Timeline items={work} />
        </>
      )}
    </section>
  );
}
