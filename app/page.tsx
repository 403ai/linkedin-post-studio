"use client";

import { useMemo, useState } from "react";

type StyleKey =
  | "plain"
  | "bold"
  | "italic"
  | "boldItalic"
  | "sans"
  | "sansBold"
  | "sansItalic"
  | "sansBoldItalic"
  | "script"
  | "double"
  | "fullwidth"
  | "underline"
  | "strike";

type FormatOption = {
  key: StyleKey;
  label: string;
  note: string;
};

const defaultDraft = `# The easiest way to lose a strong LinkedIn idea

You polish it in Markdown.
Then LinkedIn flattens everything.

**Bold becomes asterisks.**
_Emphasis disappears._
- Bullets feel cramped.
1. Numbered points need cleanup.

The fix: convert the post into LinkedIn-safe text before you paste it.`;

const formatOptions: FormatOption[] = [
  { key: "plain", label: "Clean Markdown", note: "Remove markdown marks" },
  { key: "bold", label: "Bold", note: "Unicode serif bold" },
  { key: "italic", label: "Italic", note: "Unicode italic" },
  { key: "boldItalic", label: "Bold italic", note: "Unicode emphasis" },
  { key: "sans", label: "Sans", note: "Modern letterforms" },
  { key: "sansBold", label: "Bold sans", note: "Heavier sans text" },
  { key: "sansItalic", label: "Italic sans", note: "Slanted sans text" },
  { key: "sansBoldItalic", label: "Bold italic sans", note: "Strong slanted sans" },
  { key: "script", label: "Script", note: "Best for short phrases" },
  { key: "double", label: "Doublestruck", note: "Display accent style" },
  { key: "fullwidth", label: "Fullwidth", note: "Wide visual rhythm" },
  { key: "underline", label: "Underline", note: "Combining underline" },
  { key: "strike", label: "Strikethrough", note: "Combining strike" },
];

const toolGroups = [
  {
    title: "Formatting and publishing",
    tools: [
      "LinkedIn text formatter",
      "LinkedIn post preview",
      "LinkedIn character counter",
      "Markdown cleanup",
    ],
  },
  {
    title: "Writing helpers",
    tools: [
      "Post generator",
      "Hook generator",
      "Headline generator",
      "Carousel outline generator",
    ],
  },
  {
    title: "Discovery helpers",
    tools: ["Hashtag generator", "Idea bank", "Content angle finder"],
  },
  {
    title: "Media utilities",
    tools: ["Carousel generator", "Video downloader research item"],
  },
];

const styleOffsets: Partial<Record<StyleKey, { upper?: number; lower?: number; digit?: number }>> = {
  bold: { upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce },
  italic: { upper: 0x1d434, lower: 0x1d44e },
  boldItalic: { upper: 0x1d468, lower: 0x1d482 },
  sans: { upper: 0x1d5a0, lower: 0x1d5ba, digit: 0x1d7e2 },
  sansBold: { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec },
  sansItalic: { upper: 0x1d608, lower: 0x1d622 },
  sansBoldItalic: { upper: 0x1d63c, lower: 0x1d656 },
  double: { upper: 0x1d538, lower: 0x1d552, digit: 0x1d7d8 },
  fullwidth: { upper: 0xff21, lower: 0xff41, digit: 0xff10 },
};

const doubleUpperFallback: Record<string, string> = {
  C: "ℂ",
  H: "ℍ",
  N: "ℕ",
  P: "ℙ",
  Q: "ℚ",
  R: "ℝ",
  Z: "ℤ",
};

const italicFallback: Record<string, string> = {
  h: "ℎ",
};

const scriptFallback: Record<string, string> = {
  A: "𝒜",
  B: "ℬ",
  C: "𝒞",
  D: "𝒟",
  E: "ℰ",
  F: "ℱ",
  G: "𝒢",
  H: "ℋ",
  I: "ℐ",
  J: "𝒥",
  K: "𝒦",
  L: "ℒ",
  M: "ℳ",
  N: "𝒩",
  O: "𝒪",
  P: "𝒫",
  Q: "𝒬",
  R: "ℛ",
  S: "𝒮",
  T: "𝒯",
  U: "𝒰",
  V: "𝒱",
  W: "𝒲",
  X: "𝒳",
  Y: "𝒴",
  Z: "𝒵",
  a: "𝒶",
  b: "𝒷",
  c: "𝒸",
  d: "𝒹",
  e: "ℯ",
  f: "𝒻",
  g: "ℊ",
  h: "𝒽",
  i: "𝒾",
  j: "𝒿",
  k: "𝓀",
  l: "𝓁",
  m: "𝓂",
  n: "𝓃",
  o: "ℴ",
  p: "𝓅",
  q: "𝓆",
  r: "𝓇",
  s: "𝓈",
  t: "𝓉",
  u: "𝓊",
  v: "𝓋",
  w: "𝓌",
  x: "𝓍",
  y: "𝓎",
  z: "𝓏",
};

function convertCharacter(character: string, style: StyleKey) {
  if (style === "script") {
    return scriptFallback[character] ?? character;
  }

  const offsets = styleOffsets[style];
  if (!offsets) {
    return character;
  }

  const code = character.codePointAt(0);
  if (!code) {
    return character;
  }

  if (style === "double" && doubleUpperFallback[character]) {
    return doubleUpperFallback[character];
  }

  if ((style === "italic" || style === "boldItalic") && italicFallback[character]) {
    return italicFallback[character];
  }

  if (code >= 65 && code <= 90 && offsets.upper) {
    return String.fromCodePoint(offsets.upper + code - 65);
  }

  if (code >= 97 && code <= 122 && offsets.lower) {
    return String.fromCodePoint(offsets.lower + code - 97);
  }

  if (code >= 48 && code <= 57 && offsets.digit) {
    return String.fromCodePoint(offsets.digit + code - 48);
  }

  if (style === "fullwidth" && character === " ") {
    return " ";
  }

  return character;
}

function stylizeText(text: string, style: StyleKey) {
  if (style === "plain") {
    return text;
  }

  if (style === "underline" || style === "strike") {
    const mark = style === "underline" ? "\u0332" : "\u0336";
    return Array.from(text)
      .map((character) => (character.trim() ? `${character}${mark}` : character))
      .join("");
  }

  return Array.from(text)
    .map((character) => convertCharacter(character, style))
    .join("");
}

function cleanMarkdown(markdown: string) {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+[.)]\s+/gm, (match, offset, source) => {
      const before = source.slice(0, offset);
      const lineNumber = before.split("\n").filter((line) => /^\s*\d+[.)]\s+/.test(line)).length + 1;
      return `${lineNumber}. `;
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatMarkdownInline(markdown: string) {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, (_, text) => stylizeText(text, "bold"))
    .replace(/__(.*?)__/g, (_, text) => stylizeText(text, "bold"))
    .replace(/\*(.*?)\*/g, (_, text) => stylizeText(text, "italic"))
    .replace(/_(.*?)_/g, (_, text) => stylizeText(text, "italic"))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function makeList(text: string, type: "bullet" | "number" | "check") {
  const lines = cleanMarkdown(text)
    .split("\n")
    .map((line) => line.replace(/^([•✓-]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);

  return lines
    .map((line, index) => {
      if (type === "bullet") return `• ${line}`;
      if (type === "check") return `✓ ${line}`;
      return `${index + 1}. ${line}`;
    })
    .join("\n");
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function Home() {
  const [draft, setDraft] = useState(defaultDraft);
  const [selectedStyle, setSelectedStyle] = useState<StyleKey>("plain");
  const [copiedLabel, setCopiedLabel] = useState("");

  const cleaned = useMemo(() => cleanMarkdown(draft), [draft]);
  const smartFormatted = useMemo(() => formatMarkdownInline(draft), [draft]);
  const styled = useMemo(() => stylizeText(cleaned, selectedStyle), [cleaned, selectedStyle]);
  const previewText = selectedStyle === "plain" ? smartFormatted : styled;

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    window.setTimeout(() => setCopiedLabel(""), 1600);
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="hero-band">
        <nav className="topbar" aria-label="Primary">
          <a className="brand" href="#formatter" aria-label="LinkedIn tools home">
            <span className="brand-mark">in</span>
            LinkedIn Tools
          </a>
          <div className="nav-links">
            <a href="#formatter">Formatter</a>
            <a href="#tools">Tool map</a>
            <a href="#limits">What LinkedIn allows</a>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Copy-ready LinkedIn formatting</p>
            <h1>Turn AI Markdown into a polished LinkedIn post.</h1>
            <p>
              Paste the draft an AI gave you, keep the useful structure, convert visual emphasis into
              LinkedIn-safe Unicode, and copy the result without broken Markdown marks.
            </p>
            <div className="hero-actions">
              <a href="#formatter" className="primary-link">Start formatting</a>
              <button type="button" onClick={() => copyText(previewText, "hero")}>
                {copiedLabel === "hero" ? "Copied" : "Copy current post"}
              </button>
            </div>
          </div>

          <div className="mini-post" aria-label="LinkedIn style post preview">
            <div className="post-author">
              <span className="avatar">403</span>
              <div>
                <strong>Creator workspace</strong>
                <span>LinkedIn content tools • now</span>
              </div>
            </div>
            <p>{previewText.slice(0, 280) || "Your formatted post appears here."}</p>
            <div className="post-metrics">
              <span>57 reactions</span>
              <span>24 comments</span>
              <span>{previewText.length} chars</span>
            </div>
          </div>
        </div>
      </section>

      <section className="workspace" id="formatter">
        <div className="section-heading">
          <p className="eyebrow">Formatter lab</p>
          <h2>Write once. Paste cleanly.</h2>
          <p>
            LinkedIn posts are plain text, so this tool converts Markdown structure into copyable
            characters that survive the paste.
          </p>
        </div>

        <div className="editor-grid">
          <label className="editor-panel">
            <span>AI draft or Markdown</span>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
          </label>

          <div className="preview-panel">
            <div className="panel-head">
              <span>LinkedIn-ready output</span>
              <button type="button" onClick={() => copyText(previewText, "output")}>
                {copiedLabel === "output" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre>{previewText}</pre>
            <div className="stats-row">
              <span>{previewText.length} characters</span>
              <span>{countWords(previewText)} words</span>
              <span>{previewText.split("\n").length} lines</span>
            </div>
          </div>
        </div>

        <div className="format-grid">
          {formatOptions.map((option) => (
            <button
              className={selectedStyle === option.key ? "format-card active" : "format-card"}
              key={option.key}
              type="button"
              onClick={() => setSelectedStyle(option.key)}
            >
              <span>{option.label}</span>
              <small>{option.note}</small>
              <strong>{stylizeText("LinkedIn", option.key)}</strong>
            </button>
          ))}
        </div>

        <div className="quick-actions" aria-label="List format actions">
          <button type="button" onClick={() => copyText(makeList(draft, "bullet"), "bullet")}>
            {copiedLabel === "bullet" ? "Copied" : "Copy bullet list"}
          </button>
          <button type="button" onClick={() => copyText(makeList(draft, "number"), "number")}>
            {copiedLabel === "number" ? "Copied" : "Copy numbered list"}
          </button>
          <button type="button" onClick={() => copyText(makeList(draft, "check"), "check")}>
            {copiedLabel === "check" ? "Copied" : "Copy checklist"}
          </button>
        </div>
      </section>

      <section className="tool-map" id="tools">
        <div className="section-heading">
          <p className="eyebrow">Public tool set</p>
          <h2>The creator toolbox to build next.</h2>
        </div>
        <div className="tool-grid">
          {toolGroups.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="limits" id="limits">
        <div>
          <p className="eyebrow">What can be edited</p>
          <h2>LinkedIn formatting is mostly text illusion.</h2>
        </div>
        <ul>
          <li>Works well: spacing, line breaks, bullets, numbered lists, checklists, emojis, hashtags, links, and Unicode text styles.</li>
          <li>Useful with care: bold, italic, underline, strikethrough, script, doublestruck, fullwidth, and sans variants.</li>
          <li>Not truly supported inside post text: real Markdown, custom font size, colors, headings, rich HTML, or accessible semantic bold/italic.</li>
        </ul>
      </section>
    </main>
  );
}
