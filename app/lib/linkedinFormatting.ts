export type StyleKey =
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

export type FormatOption = {
  key: StyleKey;
  label: string;
  note: string;
};

export const defaultDraft = `# The easiest way to lose a strong LinkedIn idea

You polish it in Markdown.
Then LinkedIn flattens everything.

**Bold becomes asterisks.**
_Emphasis disappears._
- Bullets feel cramped.
1. Numbered points need cleanup.

The fix: convert the post into LinkedIn-safe text before you paste it.`;

export const formatOptions: FormatOption[] = [
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

  return character;
}

export function stylizeText(text: string, style: StyleKey) {
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

export function cleanMarkdown(markdown: string) {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+[.)]\s+/gm, (_match, offset, source) => {
      const before = source.slice(0, offset);
      const lineNumber = before.split("\n").filter((line) => /^\s*\d+[.)]\s+/.test(line)).length + 1;
      return `${lineNumber}. `;
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function formatMarkdownInline(markdown: string) {
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

export function makeList(text: string, type: "bullet" | "number" | "check") {
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

export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
