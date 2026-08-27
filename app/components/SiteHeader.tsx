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
        <Link href="/settings">Settings</Link>
      </div>
      <div className="mobile-tool-link">
        <Link href="/settings">Settings</Link>
      </div>
    </nav>
  );
}
