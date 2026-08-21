import { LinkedInPostCard } from "./components/LinkedInPostCard";
import { SiteHeader } from "./components/SiteHeader";
import { categories, tools } from "./lib/tools";

const samplePost = `AI drafts are useful.

But LinkedIn does not paste Markdown as rich text.

Use a formatter first, then publish with clean spacing and copy-ready emphasis.`;

const allowedEdits = [
  "Spacing, line breaks, bullets, numbered lists, checklists, emojis, hashtags, mentions, and links",
  "Unicode text styles for visual bold, italic, underline, strikethrough, script, doublestruck, fullwidth, and sans variants",
  "Post structure helpers such as hooks, headlines, outlines, counters, previews, and reusable content patterns",
];

const notSupported = [
  "Real Markdown styling inside the LinkedIn post editor",
  "Custom font sizes, colors, headings, tables, or rich HTML inside normal post text",
  "Semantic bold and italic that screen readers understand as formatting rather than special characters",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="hero-band">
        <SiteHeader />

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Public LinkedIn creator tools</p>
            <h1>One clean workspace for better LinkedIn posts.</h1>
            <p>
              A growing set of tools for formatting AI drafts, previewing posts, shaping hooks,
              checking length, planning carousels, and preparing copy that survives the paste into LinkedIn.
            </p>
            <div className="hero-actions">
              <a href="/tools/text-formatter" className="primary-link">Open text formatter</a>
              <a href="#tools" className="secondary-link">Browse all tools</a>
            </div>
          </div>

          <LinkedInPostCard text={samplePost} />
        </div>
      </section>

      <section className="tool-map" id="tools">
        <div className="section-heading">
          <p className="eyebrow">Tool directory</p>
          <h2>Each tool gets its own focused page.</h2>
          <p>
            The homepage stays informational. The subpages hold the working interfaces, examples,
            and future AI-powered workflows for each LinkedIn creator task.
          </p>
        </div>

        {categories.map((category) => (
          <div className="category-block" key={category}>
            <h3>{category}</h3>
            <div className="tool-grid">
              {tools
                .filter((tool) => tool.category === category)
                .map((tool) => (
                  <a className="tool-card" href={`/tools/${tool.slug}`} key={tool.slug}>
                    <span className={`status-pill ${tool.status}`}>{tool.status}</span>
                    <h4>{tool.title}</h4>
                    <p>{tool.description}</p>
                  </a>
                ))}
            </div>
          </div>
        ))}
      </section>

      <section className="limits" id="limits">
        <div>
          <p className="eyebrow">What LinkedIn allows</p>
          <h2>Most post styling is a plain-text workaround.</h2>
        </div>
        <div className="limits-columns">
          <article>
            <h3>Good fit</h3>
            <ul>
              {allowedEdits.map((edit) => (
                <li key={edit}>{edit}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Not supported</h3>
            <ul>
              {notSupported.map((edit) => (
                <li key={edit}>{edit}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
