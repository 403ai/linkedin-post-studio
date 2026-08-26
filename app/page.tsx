import { SiteHeader } from "./components/SiteHeader";
import { TextFormatter } from "./components/TextFormatter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="studio-shell">
        <SiteHeader />

        <div className="studio-heading" id="studio">
          <div>
            <p className="eyebrow">LinkedIn Post Studio</p>
            <h1>Write, format, preview, and copy one clean LinkedIn post.</h1>
            <p>
              Paste an AI draft or write from scratch. The studio converts Markdown-style emphasis,
              gives you LinkedIn-safe formatting controls, shows desktop and mobile previews, and keeps
              the post limits visible while you edit.
            </p>
          </div>
          <div className="studio-status-panel" aria-label="Studio features">
            <span>Markdown paste cleanup</span>
            <span>LinkedIn-style preview</span>
            <span>Character and hashtag checks</span>
            <span>Copy-ready Unicode styling</span>
          </div>
        </div>

        <div className="studio-workspace">
          <TextFormatter />
        </div>
      </section>
    </main>
  );
}
