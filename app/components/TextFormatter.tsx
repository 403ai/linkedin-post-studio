"use client";

import { ClipboardEvent, useEffect, useMemo, useRef, useState } from "react";
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
import { AI_SETTINGS_STORAGE_KEY, createDefaultAiSettings, type AiSettingsState } from "../lib/aiSettings";
import { isAssistAction, type AssistActionKey } from "../lib/assistPrompts";
import { LinkedInPostCard } from "./LinkedInPostCard";

type ListFormat = "bullet" | "number" | "check";
type FormatterView = "write" | "preview" | "assist";
type OpenPanel = "font" | "emoji" | null;
type PreviewDevice = "desktop" | "mobile";

const LINKEDIN_POST_LIMIT = 3000;
const ICON_SIZE = 16;
const ASSIST_MEMORY_STORAGE_KEY = "linkedin-post-studio-assist-memory";
const ASSIST_HISTORY_LIMIT = 5;

type AssistGeneration = {
  action: AssistActionKey;
  createdAt: string;
  id: string;
  inputSummary: string;
  output: string;
  tone: string;
};

type AssistHistory = Record<AssistActionKey, AssistGeneration[]>;

type AssistMemory = {
  activeAction: AssistActionKey;
  audience: string;
  brief: string;
  goal: string;
  length: string;
  output: string;
  outputsByAction: AssistHistory;
  tone: string;
  voice: string;
};

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

const assistActionLabels = new Map(assistGroups.flatMap((group) => group.actions.map((action) => [action.key, action.label] as const)));
const assistActions = assistGroups.flatMap((group) => group.actions);

function createEmptyAssistHistory(): AssistHistory {
  return Object.fromEntries(assistActions.map((action) => [action.key, []])) as AssistHistory;
}

function normalizeAssistHistory(value: unknown): AssistHistory {
  const nextHistory = createEmptyAssistHistory();

  if (!value || typeof value !== "object") {
    return nextHistory;
  }

  for (const action of assistActions) {
    const items = (value as Partial<AssistHistory>)[action.key];

    if (!Array.isArray(items)) {
      continue;
    }

    nextHistory[action.key] = items
      .filter((item): item is AssistGeneration => {
        return Boolean(
          item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.createdAt === "string" &&
            typeof item.inputSummary === "string" &&
            typeof item.output === "string" &&
            typeof item.tone === "string" &&
            isAssistAction(item.action),
        );
      })
      .slice(0, ASSIST_HISTORY_LIMIT);
  }

  return nextHistory;
}

function summarizeAssistInput({
  audience,
  brief,
  currentPost,
  goal,
}: {
  audience: string;
  brief: string;
  currentPost: string;
  goal: string;
}) {
  const source = brief.trim() || currentPost.trim() || "Current post";
  const compactSource = source.replace(/\s+/g, " ").slice(0, 82);
  const audienceLabel = audience.trim() ? ` for ${audience.trim().slice(0, 32)}` : "";

  return `${compactSource}${source.length > 82 ? "..." : ""}${audienceLabel} · ${goal}`;
}

function formatAssistHistoryDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Saved generation";
  }

  return date.toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

function createDefaultAssistMemory(): AssistMemory {
  return {
    activeAction: "generatePost",
    audience: "",
    brief: "",
    goal: "engagement",
    length: "medium",
    output: "",
    outputsByAction: createEmptyAssistHistory(),
    tone: "clear",
    voice: "",
  };
}

function readStoredAssistMemory() {
  const defaults = createDefaultAssistMemory();

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const stored = window.localStorage.getItem(ASSIST_MEMORY_STORAGE_KEY);

    if (!stored) {
      return defaults;
    }

    const parsed = JSON.parse(stored) as Partial<AssistMemory>;

    return {
      ...defaults,
      activeAction: isAssistAction(parsed.activeAction) ? parsed.activeAction : defaults.activeAction,
      audience: typeof parsed.audience === "string" ? parsed.audience : defaults.audience,
      brief: typeof parsed.brief === "string" ? parsed.brief : defaults.brief,
      goal: typeof parsed.goal === "string" ? parsed.goal : defaults.goal,
      length: typeof parsed.length === "string" ? parsed.length : defaults.length,
      output: typeof parsed.output === "string" ? parsed.output : defaults.output,
      outputsByAction: normalizeAssistHistory(parsed.outputsByAction),
      tone: typeof parsed.tone === "string" ? parsed.tone : defaults.tone,
      voice: typeof parsed.voice === "string" ? parsed.voice : defaults.voice,
    };
  } catch {
    window.localStorage.removeItem(ASSIST_MEMORY_STORAGE_KEY);
    return defaults;
  }
}

export function TextFormatter() {
  const [assistMemorySeed] = useState(() => readStoredAssistMemory());
  const [draft, setDraft] = useState(() => formatMarkdownInline(defaultDraft));
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [autoConvertMarkdown, setAutoConvertMarkdown] = useState(true);
  const [copiedLabel, setCopiedLabel] = useState("");
  const [activeView, setActiveView] = useState<FormatterView>("write");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [activeAssist, setActiveAssist] = useState<AssistActionKey>(assistMemorySeed.activeAction);
  const [assistAudience, setAssistAudience] = useState(assistMemorySeed.audience);
  const [assistBrief, setAssistBrief] = useState(assistMemorySeed.brief);
  const [assistGoal, setAssistGoal] = useState(assistMemorySeed.goal);
  const [assistLength, setAssistLength] = useState(assistMemorySeed.length);
  const [assistTone, setAssistTone] = useState(assistMemorySeed.tone);
  const [assistVoice, setAssistVoice] = useState(assistMemorySeed.voice);
  const [assistOutput, setAssistOutput] = useState(assistMemorySeed.output);
  const [assistError, setAssistError] = useState("");
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistHistory, setAssistHistory] = useState<AssistHistory>(assistMemorySeed.outputsByAction);
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

  useEffect(() => {
    const memory: AssistMemory = {
      activeAction: activeAssist,
      audience: assistAudience,
      brief: assistBrief,
      goal: assistGoal,
      length: assistLength,
      output: assistOutput,
      outputsByAction: assistHistory,
      tone: assistTone,
      voice: assistVoice,
    };

    window.localStorage.setItem(ASSIST_MEMORY_STORAGE_KEY, JSON.stringify(memory));
  }, [
    activeAssist,
    assistAudience,
    assistBrief,
    assistGoal,
    assistHistory,
    assistLength,
    assistOutput,
    assistTone,
    assistVoice,
  ]);

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

  function readAiSettings() {
    const defaults = createDefaultAiSettings();

    try {
      const stored = window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
      if (!stored) {
        return defaults;
      }

      const parsed = JSON.parse(stored) as AiSettingsState;
      return {
        ...defaults,
        ...parsed,
        providers: {
          ...defaults.providers,
          ...parsed.providers,
        },
      };
    } catch {
      return defaults;
    }
  }

  async function generateAssistDraft() {
    closePanel();
    setAssistError("");
    setAssistLoading(true);

    const settings = readAiSettings();
    const providerSettings = settings.providers[settings.activeProvider];
    const enrichedBrief = [
      assistBrief.trim(),
      assistAudience.trim() ? `Audience: ${assistAudience.trim()}` : "",
      `Goal: ${assistGoal}`,
      `Length: ${assistLength}`,
      assistVoice.trim() ? `Voice notes: ${assistVoice.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const response = await fetch("/api/assist", {
        body: JSON.stringify({
          action: activeAssist,
          brief: enrichedBrief,
          currentPost: previewText,
          provider: settings.activeProvider,
          providerSettings,
          tone: assistTone,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as { error?: string; output?: string };

      if (!response.ok) {
        throw new Error(data.error || "AI generation failed.");
      }

      const output = data.output ?? "";
      const generation: AssistGeneration = {
        action: activeAssist,
        createdAt: new Date().toISOString(),
        id: `${activeAssist}-${Date.now()}`,
        inputSummary: summarizeAssistInput({
          audience: assistAudience,
          brief: assistBrief,
          currentPost: previewText,
          goal: assistGoal,
        }),
        output,
        tone: assistTone,
      };

      setAssistOutput(output);
      setAssistHistory((currentHistory) => ({
        ...currentHistory,
        [activeAssist]: [generation, ...currentHistory[activeAssist].filter((item) => item.output !== output)].slice(0, ASSIST_HISTORY_LIMIT),
      }));
    } catch (error) {
      setAssistError(error instanceof Error ? error.message : "AI generation failed.");
    } finally {
      setAssistLoading(false);
    }
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
  const activeAssistHistory = assistHistory[activeAssist] ?? [];

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
                              const latestGeneration = assistHistory[action.key][0];

                              setActiveAssist(action.key);
                              setAssistOutput(latestGeneration?.output ?? "");
                              setAssistError("");
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

                  <div className="assist-control-grid">
                    <label className="assist-field">
                      <span>Audience</span>
                      <input
                        onChange={(event) => setAssistAudience(event.target.value)}
                        placeholder="Founders, job seekers, engineers..."
                        type="text"
                        value={assistAudience}
                      />
                    </label>
                    <label className="assist-field">
                      <span>Goal</span>
                      <select onChange={(event) => setAssistGoal(event.target.value)} value={assistGoal}>
                        <option value="engagement">Engagement</option>
                        <option value="education">Education</option>
                        <option value="authority">Authority</option>
                        <option value="storytelling">Storytelling</option>
                        <option value="lead generation">Lead generation</option>
                      </select>
                    </label>
                    <label className="assist-field">
                      <span>Length</span>
                      <select onChange={(event) => setAssistLength(event.target.value)} value={assistLength}>
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                      </select>
                    </label>
                  </div>

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
                    <label className="assist-field compact wide">
                      <span>Voice notes</span>
                      <input
                        onChange={(event) => setAssistVoice(event.target.value)}
                        placeholder="Founder-led, technical, plainspoken..."
                        type="text"
                        value={assistVoice}
                      />
                    </label>
                    <button className="generate-assist-button" disabled={assistLoading} onClick={generateAssistDraft} type="button">
                      {assistLoading ? "Generating..." : "Generate draft"}
                    </button>
                  </div>

                  <div className="assist-output" aria-live="polite">
                    {assistError ? (
                      <div className="assist-empty error">
                        <strong>Generation failed.</strong>
                        <span>{assistError}</span>
                      </div>
                    ) : assistLoading ? (
                      <div className="assist-empty">
                        <strong>Generating draft...</strong>
                        <span>The selected provider is writing a LinkedIn-ready response.</span>
                      </div>
                    ) : assistOutput ? (
                      <pre>{assistOutput}</pre>
                    ) : (
                      <div className="assist-empty">
                        <strong>Generated text will appear here.</strong>
                        <span>Choose an action, confirm your provider in Settings, and generate a draft.</span>
                      </div>
                    )}
                  </div>

                  {activeAssistHistory.length > 0 && (
                    <div className="assist-history">
                      <div className="assist-history-heading">
                        <strong>Recent generations</strong>
                        <span>{activeAssistHistory.length} saved</span>
                      </div>
                      <div className="assist-history-list">
                        {activeAssistHistory.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setAssistOutput(item.output);
                              setAssistError("");
                            }}
                            type="button"
                          >
                            <span>{formatAssistHistoryDate(item.createdAt)}</span>
                            <small>{item.inputSummary}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="assist-apply-row">
                    <button disabled={!assistOutput || assistLoading} onClick={replaceWithAssistOutput} type="button">
                      Replace post
                    </button>
                    <button disabled={!assistOutput || assistLoading} onClick={insertAssistOutput} type="button">
                      Insert at cursor
                    </button>
                    <button disabled={!assistOutput || assistLoading} onClick={appendAssistOutput} type="button">
                      Append
                    </button>
                    <button disabled={!assistOutput || assistLoading} onClick={() => copyText(assistOutput, "assist")} type="button">
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
