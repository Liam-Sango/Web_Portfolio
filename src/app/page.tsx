"use client";

import { useState } from "react";
import NavBar, { type SectionId } from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import BlogSection from "@/components/BlogSection";
import ContactSection from "@/components/ContactSection";

const SOCIALS = {
  github: "https://github.com/Liam-Sango",
  linkedin: "https://www.linkedin.com/in/liam-sango",
  email: "mailto:hello@liamsango.dev",
};

export default function Home() {
  const [active, setActive] = useState<SectionId | null>(null);

  function handleNavigate(id: SectionId) {
    setActive(id);
  }

  function handleHome() {
    setActive(null);
  }

  return (
    <>
      <NavBar active={active} onNavigate={handleNavigate} onHome={handleHome} />

      <main>
        <div className="site-container">
          {/* Keyed so the enter animation retriggers on every tab switch */}
          <div key={active ?? "home"} className="panel-enter">
            {active === null && <HeroSection onNavigate={handleNavigate} />}
            {active === "about" && <AboutSection />}
            {active === "skills" && <SkillsSection />}
            {active === "experience" && <ExperienceSection />}
            {active === "projects" && <ProjectsSection />}
            {active === "blog" && <BlogSection />}
            {active === "contact" && <ContactSection socials={SOCIALS} />}
          </div>
        </div>
      </main>

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
            <a
              href="https://github.com/Liam-Sango/002"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
