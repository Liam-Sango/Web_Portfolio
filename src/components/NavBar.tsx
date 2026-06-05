const NAV_ITEMS = [
  { id: "about", label: "About Me" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Blog" },
] as const;

export type SectionId = (typeof NAV_ITEMS)[number]["id"];

interface NavBarProps {
  active: SectionId | null;
  onNavigate: (id: SectionId) => void;
}

export default function NavBar({ active, onNavigate }: NavBarProps) {
  return (
    <nav className="win-navbar" role="navigation" aria-label="Site sections">
      <div className="site-container nav-inner">
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`win-btn nav-btn${active === item.id ? " nav-btn--active" : ""}`}
              onClick={() => onNavigate(item.id)}
              aria-pressed={active === item.id}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
