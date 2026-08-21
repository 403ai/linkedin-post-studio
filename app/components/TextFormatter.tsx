"use client";

import { ClipboardEvent, useMemo, useRef, useState } from "react";
import {
  cleanMarkdown,
  countWords,
  defaultDraft,
  formatMarkdownInline,
  makeList,
  StyleKey,
  stylizeText,
} from "../lib/linkedinFormatting";

type ListFormat = "bullet" | "number" | "check";

const toolbarStyles: { key: StyleKey; label: string; title: string }[] = [
  { key: "bold", label: "B", title: "Bold selected text" },
  { key: "italic", label: "I", title: "Italic selected text" },
  { key: "underline", label: "U", title: "Underline selected text" },
  { key: "strike", label: "S", title: "Strikethrough selected text" },
  { key: "sansBold", label: "Aa", title: "Bold sans selected text" },
  { key: "script", label: "Sc", title: "Script selected text" },
];

export function TextFormatter() {
  const [draft, setDraft] = useState(() => formatMarkdownInline(defaultDraft));
  const [autoConvertMarkdown, setAutoConvertMarkdown] = useState(true);
  const [copiedLabel, setCopiedLabel] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const previewText = useMemo(() => cleanMarkdown(draft), [draft]);

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    window.setTimeout(() => setCopiedLabel(""), 1600);
  }

  function focusSelection(start: number, end: number) {
    requestAnimationFrame(() => {
      editorRef.current?.focus();
      editorRef.current?.setSelectionRange(start, end);
    });
  }

  function getTargetRange(mode: "selection" | "line" = "selection") {
    const editor = editorRef.current;
    if (!editor) {
      return { start: 0, end: 0 };
    }

    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    if (start !== end || mode === "selection") {
      return { start, end };
    }

    const lineStart = draft.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const nextBreak = draft.indexOf("\n", start);
    const lineEnd = nextBreak === -1 ? draft.length : nextBreak;

    return { start: lineStart, end: lineEnd };
  }

  function replaceRange(start: number, end: number, replacement: string) {
    const nextDraft = `${draft.slice(0, start)}${replacement}${draft.slice(end)}`;
    setDraft(nextDraft);
    focusSelection(start, start + replacement.length);
  }

  function applyStyle(style: StyleKey) {
    const { start, end } = getTargetRange("line");
    const selectedText = draft.slice(start, end);

    if (!selectedText) {
      return;
    }

    replaceRange(start, end, stylizeText(selectedText, style));
  }

  function applyList(type: ListFormat) {
    const { start, end } = getTargetRange("line");
    const selectedText = draft.slice(start, end);

    if (!selectedText.trim()) {
      return;
    }

    replaceRange(start, end, makeList(selectedText, type));
  }

  function convertEditorMarkdown() {
    const converted = formatMarkdownInline(draft);
    setDraft(converted);
    focusSelection(converted.length, converted.length);
  }

  function clearStyles() {
    const { start, end } = getTargetRange("line");
    const selectedText = draft.slice(start, end);
    replaceRange(start, end, cleanMarkdown(selectedText));
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const pastedText = event.clipboardData.getData("text/plain");

    if (!autoConvertMarkdown || !pastedText) {
      return;
    }

    event.preventDefault();
    const { start, end } = getTargetRange();
    replaceRange(start, end, formatMarkdownInline(pastedText));
  }

  return (
    <div className="formatter-stack">
      <div className="formatter-layout single">
        <section className="compose-panel" aria-label="LinkedIn-safe text editor">
          <div className="format-toolbar" aria-label="Formatting toolbar">
            {toolbarStyles.map((tool) => (
              <button
                className="toolbar-button"
                key={tool.key}
                onClick={() => applyStyle(tool.key)}
                title={tool.title}
                type="button"
              >
                {tool.label}
              </button>
            ))}
            <span className="toolbar-divider" />
            <button className="toolbar-button" onClick={() => applyList("bullet")} title="Bulleted list" type="button">
              •
            </button>
            <button className="toolbar-button" onClick={() => applyList("number")} title="Numbered list" type="button">
              1.
            </button>
            <button className="toolbar-button" onClick={() => applyList("check")} title="Checklist" type="button">
              ✓
            </button>
            <span className="toolbar-divider" />
            <button className="toolbar-button wide" onClick={clearStyles} title="Clean selected text" type="button">
              Clean
            </button>
            <button className="toolbar-button wide" onClick={convertEditorMarkdown} title="Convert Markdown in current draft" type="button">
              MD
            </button>
            <button className="toolbar-button copy" onClick={() => copyText(previewText, "copy")} title="Copy post" type="button">
              {copiedLabel === "copy" ? "Copied" : "Copy"}
            </button>
          </div>

          <textarea
            aria-label="Post editor"
            className="linkedin-editor"
            onChange={(event) => setDraft(event.target.value)}
            onPaste={handlePaste}
            placeholder="Write here or paste Markdown from ChatGPT..."
            ref={editorRef}
            value={draft}
          />

          <div className="stats-row editor-stats">
            <span>{previewText.length} characters</span>
            <span>{countWords(previewText)} words</span>
            <span>{previewText.split("\n").length} lines</span>
            <label className="toggle-control compact-toggle">
              <input
                checked={autoConvertMarkdown}
                onChange={(event) => setAutoConvertMarkdown(event.target.checked)}
                type="checkbox"
              />
              Convert Markdown on paste
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
