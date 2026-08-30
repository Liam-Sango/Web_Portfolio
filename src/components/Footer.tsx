"use client";

import { SOCIALS } from "@/lib/site";

export default function Footer() {
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
        </div>
      </div>
    </footer>
  );
}
