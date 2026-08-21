import { CharacterCounterTool } from "../../components/CharacterCounterTool";
import { SiteHeader } from "../../components/SiteHeader";

export default function CharacterCounterPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="subpage-hero">
        <SiteHeader />
        <div className="subpage-heading">
          <p className="eyebrow">LinkedIn Character Counter</p>
          <h1>Check post length before publishing.</h1>
          <p>
            Measure characters, words, lines, hashtags, mentions, and estimated read time
            while you edit.
          </p>
        </div>
      </section>

      <section className="workspace">
        <CharacterCounterTool />
      </section>
    </main>
  );
}
