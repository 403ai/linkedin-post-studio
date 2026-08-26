export function SiteHeader() {
  return (
    <nav className="topbar" aria-label="Primary">
      <a className="brand" href="/" aria-label="LinkedIn Post Studio home">
        <span className="brand-mark">in</span>
        LinkedIn Post Studio
      </a>
      <div className="nav-links">
        <a href="/help">Help</a>
      </div>
      <div className="mobile-tool-link">
        <a href="/help">Help</a>
      </div>
    </nav>
  );
}
