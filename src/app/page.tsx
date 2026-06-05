import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import BlogSection from "@/components/BlogSection";

export default function Home() {
  return (
    <>
      <NavBar />
      <HeroSection />
      <main>
        <AboutSection />
        <ProjectsSection />
        <BlogSection />
      </main>
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
