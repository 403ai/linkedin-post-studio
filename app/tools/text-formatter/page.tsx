import { SiteHeader } from "../../components/SiteHeader";
import { TextFormatter } from "../../components/TextFormatter";

export default function TextFormatterPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="subpage-hero">
        <SiteHeader />
        <div className="subpage-heading">
          <p className="eyebrow">LinkedIn Text Formatter</p>
          <h1>Convert AI Markdown into copy-ready LinkedIn text.</h1>
          <p>
            Paste a draft, keep useful structure, transform emphasis into Unicode styles,
            and copy a version that will not show raw Markdown marks inside LinkedIn.
          </p>
        </div>
      </section>

      <section className="workspace">
        <TextFormatter />
      </section>
    </main>
  );
}
