export default function AboutSection() {
  return (
    <section id="about" className="section" aria-labelledby="about-heading">
      <div className="site-container">
        <div className="win-window">
          <div className="win-title-bar">
            <span>📋 About Me</span>
            <span>✕</span>
          </div>
          <div className="win-body">
            <h2 id="about-heading" className="section-title">
              About Me
            </h2>

            <p>
              I&apos;m a passionate developer who loves building things for the
              web. I enjoy working across the full stack — from crafting clean
              user interfaces to designing robust backend systems.
            </p>

            <p style={{ marginTop: "0.75rem" }}>
              When I&apos;m not coding, you can find me exploring new
              technologies, contributing to open source, or writing about what
              I&apos;ve learned.
            </p>

            <div className="resume-download">
              <a href="/resume.pdf" className="win-btn" download>
                📄 Download Resume
              </a>
              <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--win-button-shadow)" }}>
                PDF &middot; last updated June 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
