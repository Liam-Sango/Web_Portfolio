"use client";

import { SOCIALS } from "@/lib/site";
import { useNervMode } from "@/lib/useNervMode";

export default function Footer() {
  const { toggle } = useNervMode();

  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <span>© {new Date().getFullYear()} Liam Sango</span>
        <div className="footer-links">
          <a href={SOCIALS.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={SOCIALS.email}>Email</a>
          <a href={SOCIALS.source} target="_blank" rel="noopener noreferrer">
            Source
          </a>
          {/* Subtle easter-egg toggle for NERV mode (also via typing `nerv`). */}
          <button
            type="button"
            className="nerv-glyph"
            onClick={toggle}
            aria-label="Toggle NERV mode"
            title="NERV"
          >
            <span aria-hidden="true">⬡</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
