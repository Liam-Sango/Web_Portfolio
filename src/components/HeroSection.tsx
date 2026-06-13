export default function HeroSection() {
  return (
    <section className="glass-card hero" aria-labelledby="hero-heading">
      <span className="hero-kanji" aria-hidden="true">
        操縦者
      </span>
      <span className="hero-greeting">Hi, my name is</span>

      <h1 id="hero-heading" className="hero-title">
        <span className="grad">Liam Sango</span>
        <span className="caret" aria-hidden="true" />
      </h1>

      <p className="hero-role">
        Aspiring <span className="grad">cybersecurity</span> professional.
      </p>

      <p className="hero-lead">
        Studying and learning by building. Building my programming knowledge
        from the ground up using plain C — with my first real project
        &quot;Weaver&quot; already under active development.
      </p>

      <div className="btn-row">
        <a href="#projects" className="btn btn--primary">
          View Projects →
        </a>
        <a href="#about" className="btn btn--ghost">
          About Me
        </a>
        <a href="#contact" className="btn btn--ghost">
          Get in Touch
        </a>
      </div>

      <div className="hero-gauge" aria-hidden="true">
        <span className="gauge-label">SYNCHRO RATIO</span>
        <span className="gauge-track">
          <span className="gauge-fill" />
        </span>
        <span className="gauge-val">100.0%</span>
      </div>

      <div className="hero-meta">
        <span>
          <span className="status-dot" aria-hidden="true" /> Available for work
        </span>
        <span>Melbourne · Victoria</span>
        <span>Last updated 2026.06</span>
      </div>
    </section>
  );
}
