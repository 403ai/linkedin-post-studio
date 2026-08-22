"use client";

import { ClipboardEvent, useMemo, useRef, useState } from "react";
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
import { LinkedInPostCard } from "./LinkedInPostCard";

type ListFormat = "bullet" | "number" | "check";
type FormatterView = "write" | "preview" | "checks";

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
  const [activeView, setActiveView] = useState<FormatterView>("write");
  const [pasteStatus, setPasteStatus] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const previewText = useMemo(() => cleanMarkdown(draft), [draft]);
  const checks = useMemo(() => {
    const styledCharacters = Array.from(previewText).filter((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code > 0x024f || /[\u0332\u0336]/u.test(character);
    }).length;
    const hashtags = previewText.match(/(^|\s)#[\p{L}\p{N}_]+/gu) ?? [];
    const mentions = previewText.match(/(^|\s)@[\p{L}\p{N}_.-]+/gu) ?? [];
    const styledRatio = previewText.length ? styledCharacters / previewText.length : 0;
    const status = styledRatio > 0.18 ? "Use less styled text" : "LinkedIn-safe";

    return {
      characters: previewText.length,
      words: countWords(previewText),
      lines: previewText ? previewText.split("\n").length : 0,
      hashtags: hashtags.length,
      mentions: mentions.length,
      styledCharacters,
      status,
    };
  }, [previewText]);

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    window.setTimeout(() => setCopiedLabel(""), 1600);
  }

  function showPasteStatus(message: string) {
    setPasteStatus(message);
    window.setTimeout(() => setPasteStatus(""), 1800);
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
      showPasteStatus("Plain text pasted");
      return;
    }

    event.preventDefault();
    const { start, end } = getTargetRange();
    replaceRange(start, end, formatMarkdownInline(pastedText));
    showPasteStatus("Markdown converted");
  }

  return (
    <div className="formatter-stack">
      <div className="formatter-topline">
        <div className="segmented-control" aria-label="Formatter views">
          {(["write", "preview", "checks"] as FormatterView[]).map((view) => (
            <button
              aria-pressed={activeView === view}
              className={activeView === view ? "active" : ""}
              key={view}
              onClick={() => setActiveView(view)}
              type="button"
            >
              {view}
            </button>
          ))}
        </div>
        <button className="copy-post-button" onClick={() => copyText(previewText, "copy")} type="button">
          {copiedLabel === "copy" ? "Copied" : "Copy post"}
        </button>
      </div>

      <div className="formatter-layout single">
        <section className="compose-panel" aria-label="LinkedIn-safe text editor">
          {activeView === "write" && (
            <>
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
                <details className="more-styles">
                  <summary>More</summary>
                  <div>
                    {formatOptions
                      .filter((option) => !["plain", "bold", "italic", "underline", "strike", "sansBold", "script"].includes(option.key))
                      .map((option) => (
                        <button key={option.key} onClick={() => applyStyle(option.key)} type="button">
                          {option.label}
                        </button>
                      ))}
                  </div>
                </details>
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
            </>
          )}

          {activeView === "preview" && (
            <div className="preview-view">
              <LinkedInPostCard text={previewText} author="Preview profile" meta="LinkedIn post preview • draft" />
            </div>
          )}

          {activeView === "checks" && (
            <div className="checks-view">
              <div className={checks.status === "LinkedIn-safe" ? "safety-banner safe" : "safety-banner warning"}>
                <strong>{checks.status}</strong>
                <span>
                  {checks.status === "LinkedIn-safe"
                    ? "The post is mostly plain text and should paste cleanly into LinkedIn."
                    : "Styled Unicode is best for short emphasis, not long paragraphs."}
                </span>
              </div>
              <div className="check-grid">
                <article><strong>{checks.characters}</strong><span>characters</span></article>
                <article><strong>{checks.words}</strong><span>words</span></article>
                <article><strong>{checks.lines}</strong><span>lines</span></article>
                <article><strong>{checks.hashtags}</strong><span>hashtags</span></article>
                <article><strong>{checks.mentions}</strong><span>mentions</span></article>
                <article><strong>{checks.styledCharacters}</strong><span>styled characters</span></article>
              </div>
            </div>
          )}

          <div className="stats-row editor-stats">
            <span>{checks.characters} characters</span>
            <span>{checks.words} words</span>
            <span>{checks.hashtags} hashtags</span>
            {pasteStatus && <span className="paste-status">{pasteStatus}</span>}
            <label className="toggle-control compact-toggle">
              <input
                checked={autoConvertMarkdown}
                onChange={(event) => setAutoConvertMarkdown(event.target.checked)}
                type="checkbox"
              />
              Smart paste
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
