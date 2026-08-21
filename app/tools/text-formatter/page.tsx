import { SiteHeader } from "../../components/SiteHeader";
import { TextFormatter } from "../../components/TextFormatter";

export default function TextFormatterPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="subpage-hero compact-hero">
        <SiteHeader />
        <div className="subpage-heading">
          <p className="eyebrow">LinkedIn Text Formatter</p>
          <h1>Format a LinkedIn post.</h1>
          <p>
            Paste Markdown or write normally. Select text to style it, then copy the post.
          </p>
        </div>
      </section>

      <section className="workspace">
        <TextFormatter />
      </section>
    </main>
  );
}
