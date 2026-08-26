"use client";

import { ClipboardEvent, useMemo, useRef, useState } from "react";
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from "emoji-picker-react";
import {
  Bold,
  ChevronDown,
  Code2,
  Eraser,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Redo2,
  Smile,
  Strikethrough,
  Type,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import {
  cleanMarkdown,
  countWords,
  defaultDraft,
  formatMarkdownInline,
  formatOptions,
  makeList,
  normalizeLinkedInText,
  StyleKey,
  stylizeText,
} from "../lib/linkedinFormatting";
import { LinkedInPostCard } from "./LinkedInPostCard";

type ListFormat = "bullet" | "number" | "check";
type FormatterView = "write" | "preview";
type OpenPanel = "font" | "emoji" | null;
type PreviewDevice = "desktop" | "mobile";

const LINKEDIN_POST_LIMIT = 3000;
const ICON_SIZE = 16;

const toolbarStyles: { key: StyleKey; Icon: LucideIcon; title: string }[] = [
  { key: "bold", Icon: Bold, title: "Bold selected text" },
  { key: "italic", Icon: Italic, title: "Italic selected text" },
  { key: "underline", Icon: Underline, title: "Underline selected text" },
  { key: "strike", Icon: Strikethrough, title: "Strikethrough selected text" },
];

const fontStyleKeys = new Set<StyleKey>([
  "boldItalic",
  "sans",
  "sansBold",
  "sansItalic",
  "sansBoldItalic",
  "script",
  "double",
  "fullwidth",
]);

const fontStyles = formatOptions.filter((option) => fontStyleKeys.has(option.key));

export function TextFormatter() {
  const [draft, setDraft] = useState(() => formatMarkdownInline(defaultDraft));
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [autoConvertMarkdown, setAutoConvertMarkdown] = useState(true);
  const [copiedLabel, setCopiedLabel] = useState("");
  const [activeView, setActiveView] = useState<FormatterView>("write");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [pasteStatus, setPasteStatus] = useState("");
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const previewText = useMemo(() => cleanMarkdown(draft), [draft]);
  const checks = useMemo(() => {
    const styledCharacters = Array.from(previewText).filter((character) => {
      const code = character.codePointAt(0) ?? 0;
      return (
        (code >= 0x1d400 && code <= 0x1d7ff) ||
        (code >= 0xff10 && code <= 0xff5a) ||
        /[\u0332\u0336]/u.test(character)
      );
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
      remaining: LINKEDIN_POST_LIMIT - previewText.length,
      limitPercent: Math.min(100, Math.round((previewText.length / LINKEDIN_POST_LIMIT) * 100)),
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

  function closePanel() {
    setOpenPanel(null);
  }

  function togglePanel(panel: Exclude<OpenPanel, null>) {
    setOpenPanel((currentPanel) => (currentPanel === panel ? null : panel));
  }

  function updateDraft(nextDraft: string, remember = true) {
    if (remember && nextDraft !== draft) {
      setHistory((items) => [...items.slice(-60), draft]);
      setFuture([]);
    }

    setDraft(nextDraft);
  }

  function undoDraft() {
    closePanel();
    const previous = history.at(-1);
    if (previous === undefined) {
      return;
    }

    setHistory((items) => items.slice(0, -1));
    setFuture((items) => [draft, ...items.slice(0, 60)]);
    setDraft(previous);
    focusSelection(previous.length, previous.length);
  }

  function redoDraft() {
    closePanel();
    const next = future[0];
    if (next === undefined) {
      return;
    }

    setFuture((items) => items.slice(1));
    setHistory((items) => [...items.slice(-60), draft]);
    setDraft(next);
    focusSelection(next.length, next.length);
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
    updateDraft(nextDraft);
    focusSelection(start, start + replacement.length);
  }

  function applyStyle(style: StyleKey) {
    closePanel();
    const { start, end } = getTargetRange("line");
    const selectedText = draft.slice(start, end);

    if (!selectedText) {
      return;
    }

    replaceRange(start, end, stylizeText(selectedText, style));
  }

  function applyList(type: ListFormat) {
    closePanel();
    const { start, end } = getTargetRange("line");
    const selectedText = draft.slice(start, end);

    if (!selectedText.trim()) {
      return;
    }

    replaceRange(start, end, makeList(selectedText, type));
  }

  function convertEditorMarkdown() {
    closePanel();
    const converted = formatMarkdownInline(draft);
    updateDraft(converted);
    focusSelection(converted.length, converted.length);
  }

  function insertText(text: string) {
    const { start, end } = getTargetRange();
    replaceRange(start, end, text);
  }

  function handleEmojiClick(emoji: EmojiClickData) {
    insertText(emoji.emoji);
    closePanel();
  }

  function clearStyles() {
    closePanel();
    const { start, end } = getTargetRange("line");
    const selectedText = draft.slice(start, end);
    replaceRange(start, end, normalizeLinkedInText(selectedText));
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
          {(["write", "preview"] as FormatterView[]).map((view) => (
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
                    aria-label={tool.title}
                    className="toolbar-button"
                    key={tool.key}
                    onClick={() => applyStyle(tool.key)}
                    title={tool.title}
                    type="button"
                  >
                    <tool.Icon aria-hidden="true" size={ICON_SIZE} strokeWidth={2.25} />
                  </button>
                ))}
                <div className="toolbar-popover">
                  <button
                    aria-expanded={openPanel === "font"}
                    aria-label="Font styles"
                    className="toolbar-button font-menu-trigger"
                    onClick={() => togglePanel("font")}
                    title="Font styles"
                    type="button"
                  >
                    <Type aria-hidden="true" size={ICON_SIZE} strokeWidth={2.25} />
                    <ChevronDown aria-hidden="true" size={12} strokeWidth={2.4} />
                  </button>
                  {openPanel === "font" && (
                    <div className="font-style-menu">
                      {fontStyles.map((option) => (
                        <button key={option.key} onClick={() => applyStyle(option.key)} type="button">
                          <span>{option.label}</span>
                          <small>{option.note}</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="toolbar-divider" />
                <button aria-label="Bulleted list" className="toolbar-button" onClick={() => applyList("bullet")} title="Bulleted list" type="button">
                  <List aria-hidden="true" size={ICON_SIZE} strokeWidth={2.25} />
                </button>
                <button aria-label="Numbered list" className="toolbar-button" onClick={() => applyList("number")} title="Numbered list" type="button">
                  <ListOrdered aria-hidden="true" size={ICON_SIZE} strokeWidth={2.25} />
                </button>
                <button aria-label="Checklist" className="toolbar-button" onClick={() => applyList("check")} title="Checklist" type="button">
                  <ListChecks aria-hidden="true" size={ICON_SIZE} strokeWidth={2.25} />
                </button>
                <span className="toolbar-divider" />
                <div className="toolbar-popover">
                  <button
                    aria-expanded={openPanel === "emoji"}
                    aria-label="Add emoji"
                    className="toolbar-button"
                    onClick={() => togglePanel("emoji")}
                    title="Add emoji"
                    type="button"
                  >
                    <Smile aria-hidden="true" size={ICON_SIZE} strokeWidth={2.25} />
                  </button>
                  {openPanel === "emoji" && (
                    <div className="emoji-menu">
                      <EmojiPicker
                        className="linkedin-emoji-picker"
                        emojiStyle={EmojiStyle.TWITTER}
                        height={430}
                        lazyLoadEmojis
                        onEmojiClick={handleEmojiClick}
                        previewConfig={{ showPreview: false }}
                        searchPlaceholder="Search emoji"
                        skinTonesDisabled
                        theme={Theme.LIGHT}
                        width="100%"
                      />
                    </div>
                  )}
                </div>
                <span className="toolbar-divider" />
                <button aria-label="Undo" className="toolbar-button" disabled={!history.length} onClick={undoDraft} title="Undo" type="button">
                  <Undo2 aria-hidden="true" size={ICON_SIZE} strokeWidth={2.25} />
                </button>
                <button aria-label="Redo" className="toolbar-button" disabled={!future.length} onClick={redoDraft} title="Redo" type="button">
                  <Redo2 aria-hidden="true" size={ICON_SIZE} strokeWidth={2.25} />
                </button>
                <span className="toolbar-divider" />
                <button aria-label="Clean selected text" className="toolbar-button" onClick={clearStyles} title="Clean selected text" type="button">
                  <Eraser aria-hidden="true" size={ICON_SIZE} strokeWidth={2.25} />
                </button>
                <button aria-label="Convert Markdown in current draft" className="toolbar-button" onClick={convertEditorMarkdown} title="Convert Markdown in current draft" type="button">
                  <Code2 aria-hidden="true" size={ICON_SIZE} strokeWidth={2.25} />
                </button>
              </div>

              <textarea
                aria-label="Post editor"
                className="linkedin-editor"
                onChange={(event) => updateDraft(event.target.value)}
                onPaste={handlePaste}
                placeholder="Write here or paste Markdown from ChatGPT..."
                ref={editorRef}
                value={draft}
              />
            </>
          )}

          {activeView === "preview" && (
            <div className="preview-view">
              <div className="preview-device-row">
                <div className="segmented-control small" aria-label="Preview device">
                  {(["desktop", "mobile"] as PreviewDevice[]).map((device) => (
                    <button
                      aria-pressed={previewDevice === device}
                      className={previewDevice === device ? "active" : ""}
                      key={device}
                      onClick={() => {
                        setPreviewDevice(device);
                        setPreviewExpanded(false);
                      }}
                      type="button"
                    >
                      {device}
                    </button>
                  ))}
                </div>
              </div>
              <LinkedInPostCard
                device={previewDevice}
                expanded={previewExpanded}
                imageUrl=""
                meta="Growth at Typegrow | Helping you grow LinkedIn audience with AI"
                onToggleExpanded={() => setPreviewExpanded((expanded) => !expanded)}
                text={previewText}
                truncateAt={previewDevice === "mobile" ? 140 : 210}
                author="Alex Dahud"
              />
            </div>
          )}

          <div className="stats-row editor-stats">
            <span>{checks.characters} characters</span>
            <span className={checks.remaining < 0 ? "limit-over" : ""}>
              {checks.remaining >= 0 ? checks.remaining : Math.abs(checks.remaining)} {checks.remaining >= 0 ? "left" : "over"}
            </span>
            <span>{checks.words} words</span>
            <span>{checks.lines} lines</span>
            <span>{checks.hashtags} hashtags</span>
            <span>{checks.mentions} mentions</span>
            <span>{checks.styledCharacters} styled</span>
            <span className={checks.status === "LinkedIn-safe" ? "status-pill safe" : "status-pill warning"}>{checks.status}</span>
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
