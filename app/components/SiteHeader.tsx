export function SiteHeader() {
  return (
    <nav className="topbar" aria-label="Primary">
      <a className="brand" href="/" aria-label="LinkedIn Post Studio home">
        <span className="brand-mark">in</span>
        LinkedIn Post Studio
      </a>
      <div className="nav-links">
        <a href="/#studio">Studio</a>
        <a href="/#editor">Editor</a>
        <a href="/#checks">Checks</a>
      </div>
      <div className="mobile-tool-link">
        <a href="/#editor">Open studio</a>
      </div>
    </nav>
  );
}
