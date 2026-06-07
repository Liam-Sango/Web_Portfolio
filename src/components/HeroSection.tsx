import type { SectionId } from "@/components/NavBar";
import { asset } from "@/lib/basePath";

interface HeroSectionProps {
  onNavigate: (id: SectionId) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="glass-card hero" aria-labelledby="hero-heading">
      <span className="hero-greeting">Hi, my name is</span>

      <h1 id="hero-heading" className="hero-title">
        <span className="grad">Liam Sango</span>
      </h1>

      <p className="hero-role">
        I build <span className="grad">fast, thoughtful</span> web apps.
      </p>

      <p className="hero-lead">
        Full-stack developer with a product mindset — equally at home designing
        a relational data model, wiring up a real-time API, or sweating the
        details on a CSS grid. I care as much about the pixels you see as the
        queries behind them.
      </p>

      <div className="btn-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => onNavigate("projects")}
        >
          View Projects →
        </button>
        <a href={asset("/resume.pdf")} className="btn btn--ghost" download>
          Download Résumé
        </a>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => onNavigate("contact")}
        >
          Get in Touch
        </button>
      </div>

      <div className="hero-meta">
        <span>
          <span className="status-dot" aria-hidden="true" /> Available for new
          work
        </span>
        <span>📍 Remote · Australia</span>
      </div>
    </section>
  );
}
