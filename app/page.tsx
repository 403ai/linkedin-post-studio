import { SiteHeader } from "./components/SiteHeader";
import { TextFormatter } from "./components/TextFormatter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="studio-shell">
        <SiteHeader />

        <div className="studio-workspace">
          <TextFormatter />
        </div>
      </section>
    </main>
  );
}
