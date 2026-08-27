import { AiSettings } from "../components/AiSettings";
import { SiteHeader } from "../components/SiteHeader";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="help-shell">
        <SiteHeader />

        <div className="help-heading">
          <p className="eyebrow">Settings</p>
          <h1>Choose how Assist will generate posts.</h1>
          <p>
            Connect the studio to a local Ollama model or prepare your own API key for a hosted provider.
            These settings power the Assist tab when you generate a post, hook, hashtag set, or rewrite.
          </p>
        </div>

        <AiSettings />
      </section>
    </main>
  );
}
