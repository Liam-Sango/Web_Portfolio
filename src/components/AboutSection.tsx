import { asset } from "@/lib/basePath";

export default function AboutSection() {
  return (
    <section className="glass-card section" aria-labelledby="about-heading">
      <span className="section-eyebrow">01 — About</span>
      <h2 id="about-heading" className="section-heading">
        About Me
      </h2>

      <div className="prose" style={{ marginTop: "1.25rem" }}>
        <p>
          I&apos;m a passionate <strong>full-stack developer</strong> with over
          five years of experience building modern web applications. I
          specialize in crafting clean, performant user interfaces backed by
          robust, scalable server-side systems. My work sits at the
          intersection of thoughtful design and pragmatic engineering.
        </p>

        <p>
          My core toolkit includes <strong>React, Next.js, TypeScript,
          Node.js, and PostgreSQL</strong>. I&apos;m equally comfortable wiring
          up RESTful APIs, designing relational data models, and sweating the
          details on a CSS grid. I&apos;ve shipped features used by thousands of
          daily active users, contributed to open-source projects, and led
          architectural reviews that saved teams from costly rewrites.
        </p>

        <p>
          Before transitioning fully to the web, I cut my teeth on embedded
          systems and desktop application development — experiences that
          instilled a deep appreciation for performance constraints and
          resource-conscious design. That background still shapes how I write
          code today: I reach for simplicity first, layer in complexity only
          when it earns its keep, and measure before I optimize.
        </p>

        <p>
          I&apos;m currently open to freelance and full-time opportunities where
          I can bring a product-minded approach to an engineering team. If
          you&apos;re building something ambitious and need someone who can
          contribute across the stack — from architecture sketches to polished
          UI — I&apos;d love to hear from you.
        </p>
      </div>

      <div className="btn-row" style={{ marginTop: "1.75rem" }}>
        <a href={asset("/resume.pdf")} className="btn btn--primary" download>
          Download Résumé
        </a>
        <span
          style={{
            alignSelf: "center",
            fontSize: "0.8rem",
            color: "var(--text-dim)",
          }}
        >
          PDF · last updated June 2026
        </span>
      </div>
    </section>
  );
}
