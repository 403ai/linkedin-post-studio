import { SiteHeader } from "../components/SiteHeader";

const workflows = [
  {
    title: "Paste an AI draft",
    body: "Copy Markdown-style text from ChatGPT or another AI tool and paste it into the editor. When Markdown conversion is enabled, common bold and italic markers are converted into LinkedIn-copyable Unicode styling.",
  },
  {
    title: "Format only what matters",
    body: "Select a word, phrase, or line, then apply bold, italic, underline, strikethrough, or one of the font styles. The styling is inserted as plain text characters that survive pasting into LinkedIn.",
  },
  {
    title: "Preview before posting",
    body: "Switch to Preview to see a LinkedIn-style desktop or mobile feed card. The preview includes the creator identity, feed actions, reaction counts, and the more-button fold behavior.",
  },
  {
    title: "Use Assist when you need options",
    body: "Open Assist to generate a starting post, improve a draft, create hooks, shorten text, suggest hashtags, or write a CTA. Set audience, goal, length, tone, and voice notes, then review the result before replacing, inserting, appending, or copying it.",
  },
  {
    title: "Choose an AI provider",
    body: "Open Settings to prepare local Ollama or add your own provider API key. Settings are stored in your browser and used when Assist generates a response.",
  },
  {
    title: "Copy the final post",
    body: "Use Copy post when the draft is ready. The copied result is plain text with LinkedIn-safe spacing, lists, emoji, hashtags, mentions, and Unicode formatting.",
  },
];

const features = [
  "Markdown paste cleanup for AI-generated drafts",
  "Selection-based formatting instead of styling the whole post",
  "Bold, italic, underline, strikethrough, script, sans, doublestruck, and fullwidth text styles",
  "Emoji picker, lists, numbered lists, checklists, undo, redo, and clear styling",
  "Desktop and mobile LinkedIn-style preview",
  "Assist actions for post ideas, hook options, hashtags, shorteners, tone rewrites, and CTAs",
  "Settings for Ollama, OpenAI, Anthropic, Gemini, Groq, Mistral, and OpenRouter",
  "Character count, remaining limit, words, lines, hashtags, mentions, and styled-character checks",
];

const limitations = [
  "LinkedIn posts do not support real Markdown formatting.",
  "Normal posts do not support custom font sizes, colors, headings, tables, or rich HTML.",
  "Unicode styled text is visual styling, so it should be used sparingly for readability and accessibility.",
  "The preview is an approximation because LinkedIn can change feed layouts, line wrapping, and more-button behavior.",
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="help-shell">
        <SiteHeader />

        <div className="help-heading">
          <p className="eyebrow">Help</p>
          <h1>How to use LinkedIn Post Studio.</h1>
          <p>
            LinkedIn Post Studio is a single workspace for turning rough drafts, AI-generated Markdown,
            or plain notes into copy-ready LinkedIn posts.
          </p>
        </div>

        <section className="help-section">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>From draft to LinkedIn-ready text</h2>
          </div>
          <div className="help-grid">
            {workflows.map((item) => (
              <article className="help-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="help-section two-column">
          <article className="help-card">
            <h2>Features</h2>
            <ul>
              {features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>

          <article className="help-card">
            <h2>LinkedIn limits</h2>
            <ul>
              {limitations.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="help-section help-card">
          <h2>Recommended editing style</h2>
          <p>
            Use styling to guide attention, not decorate every sentence. A strong LinkedIn post usually
            works best with short paragraphs, intentional spacing, one clear hook, selective emphasis,
            and a preview check before copying.
          </p>
        </section>
      </section>
    </main>
  );
}
