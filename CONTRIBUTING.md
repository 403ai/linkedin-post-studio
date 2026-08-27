# Contributing

Thanks for helping improve LinkedIn Post Studio.

## Ways To Contribute

- Report a bug with clear reproduction steps.
- Suggest a focused feature that helps LinkedIn creators prepare posts.
- Improve documentation, examples, or accessibility.
- Add tests around formatting behavior.
- Improve UI details without changing the core workflow unexpectedly.

## Local Setup

```bash
pnpm install
pnpm run dev
```

Before opening a pull request, run:

```bash
pnpm run lint
pnpm run build
```

## Pull Request Guidelines

- Keep pull requests focused on one problem.
- Include screenshots or short recordings for UI changes.
- Mention any LinkedIn behavior you are trying to replicate.
- Avoid committing generated folders such as `dist`, `.next`, `.vinext`, or `node_modules`.
- Do not include API keys, local provider credentials, or personal post drafts.

## Product Principles

- The final output must remain copyable into LinkedIn.
- Prefer plain, predictable controls over decorative UI.
- Keep user text private by default.
- Make AI features optional and transparent.
- Do not claim exact LinkedIn behavior unless we can verify it.

## Maintainer Review

The maintainers may ask for changes around accessibility, copy behavior, preview accuracy, or scope. That is normal for a tool where small UI details affect real writing workflows.
