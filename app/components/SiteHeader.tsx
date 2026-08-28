import Link from "next/link";

export function SiteHeader() {
  return (
    <nav className="topbar" aria-label="Primary">
      <Link className="brand" href="/" aria-label="LinkedIn Post Studio home">
        <span className="brand-mark">in</span>
        LinkedIn Post Studio
      </Link>
      <div className="nav-links">
        <Link href="/help">Help</Link>
      </div>
      <div className="mobile-tool-link">
        <Link href="/help">Help</Link>
      </div>
    </nav>
  );
}
