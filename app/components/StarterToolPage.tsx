import { SiteHeader } from "./SiteHeader";

type StarterToolPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  inputs: string[];
  outputs: string[];
};

export function StarterToolPage({
  eyebrow,
  title,
  description,
  inputs,
  outputs,
}: StarterToolPageProps) {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="subpage-hero">
        <SiteHeader />
        <div className="subpage-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>

      <section className="starter-tool">
        <article>
          <h2>Inputs this tool should ask for</h2>
          <ul>
            {inputs.map((input) => (
              <li key={input}>{input}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Outputs this page should produce</h2>
          <ul>
            {outputs.map((output) => (
              <li key={output}>{output}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
