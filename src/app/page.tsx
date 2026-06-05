"use client";

import { useState } from "react";
import NavBar, { type SectionId } from "@/components/NavBar";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import BlogSection from "@/components/BlogSection";

export default function Home() {
  const [active, setActive] = useState<SectionId | null>(null);

  function handleNavigate(id: SectionId) {
    setActive((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <NavBar active={active} onNavigate={handleNavigate} />

      {active ? (
        <main>
          {active === "about" && <AboutSection />}
          {active === "projects" && <ProjectsSection />}
          {active === "blog" && <BlogSection />}
        </main>
      ) : (
        <div className="desktop-empty" />
      )}

      <footer className="site-footer">
        <div className="site-container">
          © {new Date().getFullYear()} Liam Sango &middot; Built with 🖥️ and
          Next.js &middot;{" "}
          <a
            href="https://github.com/Liam-Sango/002"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit" }}
          >
            Source
          </a>
        </div>
      </footer>
    </>
  );
}
