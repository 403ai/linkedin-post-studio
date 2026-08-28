# LinkedIn Post Studio

LinkedIn Post Studio is a copy-ready writing workspace for people who draft posts with AI, notes, or plain text and need the final version to work inside LinkedIn.

LinkedIn does not support Markdown formatting, custom font sizes, headings, colors, or arbitrary rich text in regular posts. This project converts common writing formats into LinkedIn-safe plain text, Unicode styles, readable spacing, and realistic post previews.

## Why This Exists

AI tools often generate posts in Markdown. When that text is pasted into LinkedIn, the formatting usually breaks or shows raw Markdown syntax. This tool helps creators:

- Paste Markdown and get LinkedIn-safe text.
- Format selected words or lines with Unicode styles.
- Preview how a post will collapse behind LinkedIn's "more" behavior.
- Check character count, words, lines, hashtags, mentions, and styled text usage.
- Copy the final post as plain text that LinkedIn accepts.

## Features

- Smart Markdown paste conversion
- Bold, italic, underline, strikethrough, sans, script, double-struck, and fullwidth Unicode styles
- Bullet, numbered, and checklist formatting
- Emoji picker
- Undo, redo, and selected-text cleanup
- Desktop and mobile LinkedIn-style preview
- Character, word, line, hashtag, mention, and styled-character checks

## Static Demo

[Open the GitHub Pages demo](https://403ai.github.io/linkedin-post-studio/)

This branch is designed for frontend-only hosting. It excludes backend AI Assist so the formatter can run on GitHub Pages.

## Tech Stack

- React
- Vinext
- Next.js runtime APIs
- TypeScript
- CSS
- OpenAI Sites hosting

## Getting Started

Requirements:

- Node.js 22.13 or newer
- pnpm

Install dependencies:

```bash
pnpm install
```

Start the local development server:

```bash
pnpm run dev
```

Build for production:

```bash
pnpm run build
```

Run lint checks:

```bash
pnpm run lint
```

## Project Status

The static branch contains the public formatter and preview workflow only. AI Assist is intentionally excluded from this branch so it can be hosted as a frontend-only demo.

Good first contribution areas:

- Improve accessibility and keyboard navigation.
- Add tests for LinkedIn formatting utilities.
- Improve documentation and examples.
- Refine preview accuracy as LinkedIn UI changes.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

For bugs, feature requests, and documentation changes, use the issue templates in GitHub. For security concerns, please follow [SECURITY.md](SECURITY.md).

## License

MIT License. See [LICENSE](LICENSE).
