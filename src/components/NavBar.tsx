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
        <button
          className="nav-brand"
          onClick={() => onNavigate(NAV_ITEMS[0].id)}
          type="button"
        >
          🖥️ Liam Sango
        </button>

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

        {/* Mobile compact nav */}
        <div className="nav-mobile" role="group" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`win-btn nav-btn-mobile${active === item.id ? " nav-btn--active" : ""}`}
              onClick={() => onNavigate(item.id)}
              aria-pressed={active === item.id}
              aria-label={item.label}
              type="button"
            >
              {item.label.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
