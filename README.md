# LinkedIn Tools

Copy-ready tools for turning AI-generated drafts into polished LinkedIn posts.

## First tool: LinkedIn text formatter

LinkedIn post text does not support real Markdown, custom font sizes, headings,
colors, or rich HTML. This app converts common AI-generated Markdown into plain
text and Unicode characters that can be copied into LinkedIn.

Current features:

- Markdown cleanup for headings, bold, italic, inline code, bullets, and spacing
- Unicode styles including bold, italic, sans, script, doublestruck, fullwidth,
  underline, and strikethrough
- Copyable bullet, numbered, and checklist formats
- LinkedIn-style post preview
- Character, word, and line counts

## Tool roadmap

The public tool set is grouped into four categories:

- Formatting and publishing: formatter, post preview, character counter,
  Markdown cleanup
- Writing helpers: post generator, hook generator, headline generator,
  carousel outline generator
- Discovery helpers: hashtag generator, idea bank, content angle finder
- Media utilities: carousel generator and a carefully scoped video downloader
  research item

## Development

```bash
pnpm install
pnpm run dev
```

Build:

```bash
pnpm run build
```

This project was bootstrapped with the OpenAI Sites starter and uses Vinext,
React, and Tailwind CSS.
