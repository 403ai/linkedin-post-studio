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
  Sparkles,
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
type FormatterView = "write" | "preview" | "assist";
type OpenPanel = "font" | "emoji" | null;
type PreviewDevice = "desktop" | "mobile";
type AssistActionKey =
  | "generatePost"
  | "turnNotes"
  | "improvePost"
  | "shortenPost"
  | "professional"
  | "conversational"
  | "generateHooks"
  | "improveHook"
  | "hashtags"
  | "cta";

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

const assistGroups: {
  title: string;
  actions: { key: AssistActionKey; label: string; description: string; needsIdea?: boolean }[];
}[] = [
  {
    title: "Create",
    actions: [
      {
        key: "generatePost",
        label: "Generate post",
        description: "Start from an idea, topic, or rough direction.",
        needsIdea: true,
      },
      {
        key: "turnNotes",
        label: "Turn notes into post",
        description: "Shape bullets or fragments into a readable post.",
        needsIdea: true,
      },
    ],
  },
  {
    title: "Improve",
    actions: [
      { key: "improvePost", label: "Improve post", description: "Make the current draft clearer and tighter." },
      { key: "shortenPost", label: "Shorten", description: "Compress the draft while keeping the point." },
      { key: "professional", label: "Professional", description: "Make the tone more polished and direct." },
      { key: "conversational", label: "Conversational", description: "Make the post warmer and more natural." },
    ],
  },
  {
    title: "Opening",
    actions: [
      { key: "generateHooks", label: "Generate hooks", description: "Create several stronger opening options." },
      { key: "improveHook", label: "Improve hook", description: "Rewrite only the first line or opening idea." },
    ],
  },
  {
    title: "Finish",
    actions: [
      { key: "hashtags", label: "Suggest hashtags", description: "Create a focused set of LinkedIn hashtags." },
      { key: "cta", label: "Create CTA", description: "Add a natural final question or next step." },
    ],
  },
];

const assistActionLabels = new Map(
  assistGroups.flatMap((group) => group.actions.map((action) => [action.key, action.label] as const)),
);

function firstLine(text: string) {
  return text.split("\n").find((line) => line.trim())?.trim() ?? "";
}

export function TextFormatter() {
  const [draft, setDraft] = useState(() => formatMarkdownInline(defaultDraft));
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [autoConvertMarkdown, setAutoConvertMarkdown] = useState(true);
  const [copiedLabel, setCopiedLabel] = useState("");
  const [activeView, setActiveView] = useState<FormatterView>("write");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [activeAssist, setActiveAssist] = useState<AssistActionKey>("generatePost");
  const [assistBrief, setAssistBrief] = useState("");
  const [assistTone, setAssistTone] = useState("clear");
  const [assistOutput, setAssistOutput] = useState("");
  const [storedSelection, setStoredSelection] = useState({ start: 0, end: 0 });
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
    setStoredSelection({ start, end });
    requestAnimationFrame(() => {
      editorRef.current?.focus();
      editorRef.current?.setSelectionRange(start, end);
    });
  }

  function getTargetRange(mode: "selection" | "line" = "selection") {
    const editor = editorRef.current;
    if (!editor) {
      return storedSelection;
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

  function rememberSelection() {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    setStoredSelection({ start: editor.selectionStart, end: editor.selectionEnd });
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

  function buildAssistOutput(action: AssistActionKey) {
    const source = previewText.trim();
    const idea = assistBrief.trim();
    const seed = idea || source || "Share one practical lesson from recent work";
    const toneNote = assistTone === "clear" ? "clear and useful" : assistTone;
    const hook = firstLine(source) || "Most people make LinkedIn posts harder than they need to be.";

    switch (action) {
      case "generatePost":
        return `${seed}\n\nHere is the ${toneNote} version:\n\n• Start with the problem people already feel\n• Share the lesson in plain language\n• Give one practical next step\n\nThe best LinkedIn posts do not need to sound bigger than the idea. They need to make the idea easier to use.\n\nWhat would you add from your own experience?`;
      case "turnNotes":
        return `I kept coming back to this idea:\n\n${seed}\n\nThe useful part is not the theory. It is what changes when someone applies it.\n\nA stronger post usually has three pieces:\n\n1. A clear problem\n2. A specific lesson\n3. A next step people can try today\n\nThat structure makes the post easier to read, easier to remember, and easier to act on.`;
      case "improvePost":
        return source
          ? `${source}\n\nThe sharper version:\n\nMake the opening more specific. Keep the middle focused on one lesson. End with a question that invites real replies.`
          : `Start with one specific observation.\n\nExplain why it matters.\n\nGive the reader one practical takeaway.\n\nThen end with a question that makes replying easy.`;
      case "shortenPost":
        return source
          ? source
              .split("\n")
              .filter((line) => line.trim())
              .slice(0, 5)
              .join("\n\n")
          : `One idea. One lesson. One next step.\n\nThat is usually enough for a strong LinkedIn post.`;
      case "professional":
        return source
          ? `Professional rewrite:\n\n${source}\n\nKey takeaway: clarity, structure, and restraint make the post easier to trust.`
          : `Professional rewrite:\n\nA clear LinkedIn post should explain the context, name the insight, and give the reader one practical action to take next.`;
      case "conversational":
        return source
          ? `Conversational rewrite:\n\n${source}\n\nThat is the part I think more people should talk about.`
          : `I used to overthink LinkedIn posts.\n\nNow I try to keep it simpler: one useful idea, written like I would explain it to a real person.`;
      case "generateHooks":
        return [
          hook,
          "A LinkedIn post gets easier when you stop trying to include everything.",
          "The first line has one job: make the next line worth reading.",
          "Most AI-generated posts fail for the same reason: they sound finished before they sound human.",
          "If your post feels too long, the problem is usually structure, not length.",
        ].join("\n");
      case "improveHook":
        return hook
          ? `Original: ${hook}\n\nOptions:\n\n1. ${hook.replace(/\.$/, "")}, but here is the part most people miss.\n2. I used to think this was complicated. It is not.\n3. The simplest version of this lesson changed how I write LinkedIn posts.`
          : `Options:\n\n1. Most LinkedIn posts become stronger when the first line gets simpler.\n2. The hook is not decoration. It is the doorway into the idea.\n3. If the first line is vague, the rest of the post has to work too hard.`;
      case "hashtags":
        return "#LinkedInCreator #ContentCreation #PersonalBranding #WritingTips #AIWorkflow";
      case "cta":
        return "What is one thing you would change before publishing this?";
      default:
        return seed;
    }
  }

  function generateAssistDraft() {
    closePanel();
    setAssistOutput(buildAssistOutput(activeAssist));
  }

  function replaceWithAssistOutput() {
    if (!assistOutput.trim()) {
      return;
    }

    updateDraft(assistOutput);
    setActiveView("write");
    focusSelection(assistOutput.length, assistOutput.length);
  }

  function appendAssistOutput() {
    if (!assistOutput.trim()) {
      return;
    }

    const separator = draft.trim() ? "\n\n" : "";
    const nextDraft = `${draft}${separator}${assistOutput}`;
    updateDraft(nextDraft);
    setActiveView("write");
    focusSelection(nextDraft.length, nextDraft.length);
  }

  function insertAssistOutput() {
    if (!assistOutput.trim()) {
      return;
    }

    setActiveView("write");
    requestAnimationFrame(() => insertText(assistOutput));
  }

  const activeAssistAction = assistGroups
    .flatMap((group) => group.actions)
    .find((action) => action.key === activeAssist);

  return (
    <div className="formatter-stack">
      <div className="formatter-topline">
        <div className="segmented-control" aria-label="Formatter views">
          {(["write", "preview", "assist"] as FormatterView[]).map((view) => (
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
        <section className="compose-panel" id="editor" aria-label="LinkedIn-safe text editor">
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
                onClick={rememberSelection}
                onChange={(event) => updateDraft(event.target.value)}
                onKeyUp={rememberSelection}
                onPaste={handlePaste}
                onSelect={rememberSelection}
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
                author="Forbidden AI"
                avatarLabel="403AI"
                device={previewDevice}
                expanded={previewExpanded}
                imageUrl=""
                meta="Build at 403ai.org | Built by AI - Overseen by Humans"
                onToggleExpanded={() => setPreviewExpanded((expanded) => !expanded)}
                postedAt="3h"
                text={previewText}
                truncateAt={previewDevice === "mobile" ? 140 : 210}
              />
            </div>
          )}

          {activeView === "assist" && (
            <div className="assist-view">
              <div className="assist-grid">
                <div className="assist-actions" aria-label="Assist actions">
                  {assistGroups.map((group) => (
                    <section className="assist-group" key={group.title}>
                      <h3>{group.title}</h3>
                      <div className="assist-action-list">
                        {group.actions.map((action) => (
                          <button
                            aria-pressed={activeAssist === action.key}
                            className={activeAssist === action.key ? "assist-action active" : "assist-action"}
                            key={action.key}
                            onClick={() => {
                              setActiveAssist(action.key);
                              setAssistOutput("");
                            }}
                            type="button"
                          >
                            <span>{action.label}</span>
                            <small>{action.description}</small>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                <section className="assist-panel" aria-label="Assist output">
                  <div className="assist-panel-heading">
                    <span className="assist-icon" aria-hidden="true">
                      <Sparkles size={16} strokeWidth={2.4} />
                    </span>
                    <div>
                      <h2>{assistActionLabels.get(activeAssist)}</h2>
                      <p>{activeAssistAction?.description}</p>
                    </div>
                  </div>

                  <label className="assist-field">
                    <span>Idea, notes, or direction</span>
                    <textarea
                      onChange={(event) => setAssistBrief(event.target.value)}
                      placeholder="Example: I want to post about how AI helps founders write faster without losing their voice."
                      value={assistBrief}
                    />
                  </label>

                  <div className="assist-controls">
                    <label className="assist-field compact">
                      <span>Tone</span>
                      <select onChange={(event) => setAssistTone(event.target.value)} value={assistTone}>
                        <option value="clear">Clear</option>
                        <option value="professional">Professional</option>
                        <option value="conversational">Conversational</option>
                        <option value="direct">Direct</option>
                      </select>
                    </label>
                    <button className="generate-assist-button" onClick={generateAssistDraft} type="button">
                      Generate draft
                    </button>
                  </div>

                  <div className="assist-output" aria-live="polite">
                    {assistOutput ? (
                      <pre>{assistOutput}</pre>
                    ) : (
                      <div className="assist-empty">
                        <strong>Generated text will appear here.</strong>
                        <span>The current version uses local sample output while we prepare the AI integration.</span>
                      </div>
                    )}
                  </div>

                  <div className="assist-apply-row">
                    <button disabled={!assistOutput} onClick={replaceWithAssistOutput} type="button">
                      Replace post
                    </button>
                    <button disabled={!assistOutput} onClick={insertAssistOutput} type="button">
                      Insert at cursor
                    </button>
                    <button disabled={!assistOutput} onClick={appendAssistOutput} type="button">
                      Append
                    </button>
                    <button disabled={!assistOutput} onClick={() => copyText(assistOutput, "assist")} type="button">
                      {copiedLabel === "assist" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}

          <div className="stats-row editor-stats" id="checks">
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
