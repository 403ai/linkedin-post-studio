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
- Optional AI Assist panel for local Ollama or bring-your-own API key providers

## Live Demo

- [Public GitHub Pages demo](https://403ai.github.io/linkedin-post-studio/) - static formatter and preview build from the `static-no-assist` branch.
- [Full app preview](https://linkedin-tools.sinisterpuppy.chatgpt.site) - main app build with the experimental Assist workflow.

## Tech Stack

- React
- Vinext
- Next.js runtime APIs
- TypeScript
- CSS
- OpenAI Sites hosting
- GitHub Pages for the static public demo

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

The core formatter and preview workflow are usable. AI Assist exists, but active feature development is currently paused while the repository is prepared for public contribution.

The public GitHub Pages demo intentionally uses the `static-no-assist` branch. That branch removes Assist and Settings so the hosted demo can run as a free static site without collecting API keys or needing server routes.

Good first contribution areas:

- Improve accessibility and keyboard navigation.
- Add tests for LinkedIn formatting utilities.
- Improve documentation and examples.
- Refine preview accuracy as LinkedIn UI changes.
- Add more provider-safe AI Assist configuration options.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

For bugs, feature requests, and documentation changes, use the issue templates in GitHub. For security concerns, please follow [SECURITY.md](SECURITY.md).

For deployment notes, see [docs/deployment.md](docs/deployment.md). For the latest repository security pass, see [docs/security-review.md](docs/security-review.md).

## License

MIT License. See [LICENSE](LICENSE).
