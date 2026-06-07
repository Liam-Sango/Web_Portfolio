import skills from "@/data/skills";

export default function SkillsSection() {
  return (
    <section className="glass-card section" aria-labelledby="skills-heading">
      <span className="section-eyebrow">02 — Skills</span>
      <h2 id="skills-heading" className="section-heading">
        Tech &amp; Tools
      </h2>
      <p className="section-intro">
        The languages, frameworks, and tools I reach for most. I&apos;m a
        generalist at heart — happy to go deep where it matters and pick up
        whatever a project needs.
      </p>

      <div className="skill-groups">
        {skills.map((group) => (
          <div key={group.category} className="skill-group">
            <h3>{group.category}</h3>
            <div className="badge-row">
              {group.items.map((item) => (
                <span key={item} className="badge">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
