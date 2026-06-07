const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof NAV_ITEMS)[number]["id"];

interface NavBarProps {
  active: SectionId | null;
  onNavigate: (id: SectionId) => void;
  onHome: () => void;
}

export default function NavBar({ active, onNavigate, onHome }: NavBarProps) {
  return (
    <nav className="nav" role="navigation" aria-label="Site sections">
      <div className="site-container nav-inner">
        <button className="nav-brand" onClick={onHome} aria-label="Home">
          <span className="brand-mark">LS</span>
          <span className="brand-name">Liam Sango</span>
        </button>

        <div className="nav-tabs">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-tab${active === item.id ? " nav-tab--active" : ""}`}
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
