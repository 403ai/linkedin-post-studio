import { PostPreviewTool } from "../../components/PostPreviewTool";
import { SiteHeader } from "../../components/SiteHeader";

export default function PostPreviewPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="subpage-hero">
        <SiteHeader />
        <div className="subpage-heading">
          <p className="eyebrow">LinkedIn Post Preview</p>
          <h1>Preview a post before it reaches the feed.</h1>
          <p>
            Paste a draft and inspect how line breaks, spacing, and opening lines feel
            inside a LinkedIn-style post card.
          </p>
        </div>
      </section>

      <section className="workspace">
        <PostPreviewTool />
      </section>
    </main>
  );
}
