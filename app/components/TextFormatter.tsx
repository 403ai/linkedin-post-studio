"use client";

import { useMemo, useState } from "react";
import {
  cleanMarkdown,
  countWords,
  defaultDraft,
  formatMarkdownInline,
  formatOptions,
  makeList,
  StyleKey,
  stylizeText,
} from "../lib/linkedinFormatting";

export function TextFormatter() {
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
    <div className="formatter-stack">
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
    </div>
  );
}
