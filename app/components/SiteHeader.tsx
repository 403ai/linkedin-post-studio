import { tools } from "../lib/tools";

export function SiteHeader() {
  return (
    <nav className="topbar" aria-label="Primary">
      <a className="brand" href="/" aria-label="LinkedIn tools home">
        <span className="brand-mark">in</span>
        LinkedIn Tools
      </a>
      <div className="nav-links">
        <a href="/#tools">Tools</a>
        <a href="/tools/text-formatter">Formatter</a>
        <a href="/#limits">LinkedIn limits</a>
      </div>
      <div className="mobile-tool-link">
        <a href={`/tools/${tools[0].slug}`}>Formatter</a>
      </div>
    </nav>
  );
}
