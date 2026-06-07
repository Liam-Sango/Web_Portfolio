interface ContactSectionProps {
  socials: {
    github: string;
    linkedin: string;
    email: string; // mailto: URL
  };
}

export default function ContactSection({ socials }: ContactSectionProps) {
  const emailAddress = socials.email.replace(/^mailto:/, "");

  return (
    <section className="glass-card section" aria-labelledby="contact-heading">
      <span className="section-eyebrow">06 — Contact</span>
      <h2 id="contact-heading" className="section-heading">
        Let&apos;s Talk
      </h2>
      <p className="section-intro">
        I&apos;m currently open to freelance and full-time opportunities.
        Whether you have a project in mind or just want to say hello, my inbox
        is always open — I&apos;ll do my best to get back to you.
      </p>

      <div className="btn-row">
        <a href={socials.email} className="btn btn--primary">
          Say Hello ↗
        </a>
      </div>

      <div className="contact-grid">
        <a href={socials.email} className="contact-tile">
          <span className="tile-icon" aria-hidden="true">
            ✉️
          </span>
          <span>
            <span className="tile-label">Email</span>
            <br />
            <span className="tile-value">{emailAddress}</span>
          </span>
        </a>

        <a
          href={socials.github}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-tile"
        >
          <span className="tile-icon" aria-hidden="true">
            🐙
          </span>
          <span>
            <span className="tile-label">GitHub</span>
            <br />
            <span className="tile-value">@Liam-Sango</span>
          </span>
        </a>

        <a
          href={socials.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-tile"
        >
          <span className="tile-icon" aria-hidden="true">
            💼
          </span>
          <span>
            <span className="tile-label">LinkedIn</span>
            <br />
            <span className="tile-value">in/liam-sango</span>
          </span>
        </a>
      </div>
    </section>
  );
}
