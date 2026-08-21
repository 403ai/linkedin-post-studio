"use client";

import { useMemo, useState } from "react";
import { countWords } from "../lib/linkedinFormatting";

const defaultText = `Paste a LinkedIn post here to check length, words, lines, hashtags, and mentions before publishing.`;

export function CharacterCounterTool() {
  const [text, setText] = useState(defaultText);
  const stats = useMemo(() => {
    const hashtags = text.match(/(^|\s)#[\p{L}\p{N}_]+/gu) ?? [];
    const mentions = text.match(/(^|\s)@[\p{L}\p{N}_.-]+/gu) ?? [];
    const words = countWords(text);

    return {
      characters: text.length,
      words,
      lines: text ? text.split("\n").length : 0,
      hashtags: hashtags.length,
      mentions: mentions.length,
      readTime: Math.max(1, Math.ceil(words / 220)),
    };
  }, [text]);

  return (
    <div className="tool-split">
      <label className="editor-panel compact">
        <span>Post text</span>
        <textarea value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      <div className="metric-board">
        {Object.entries(stats).map(([label, value]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label === "readTime" ? "min read" : label}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
