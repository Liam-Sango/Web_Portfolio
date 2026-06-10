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
        Still studying, and learning by building — small tools in C and Python
        and a security project called Weaver. I&apos;m most interested in how
        systems work under the hood, and how they break.
      </p>

      <div className="btn-row">
        <a href="#projects" className="btn btn--primary">
          View Projects →
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
        <span>Remote · Australia</span>
        <span>Last updated 2026.06</span>
      </div>
    </section>
  );
}
