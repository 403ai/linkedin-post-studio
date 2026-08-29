# Deployment

LinkedIn Post Studio currently has two deployment paths.

## Public Static Demo

The public demo is hosted on GitHub Pages:

https://403ai.github.io/linkedin-post-studio/

This build comes from the `static-no-assist` branch. It includes the formatter, copy workflow, checks, Help page, and LinkedIn-style preview. It does not include Assist or Settings because GitHub Pages is static hosting and cannot run the AI backend route.

Use this path when the goal is a free public demo that does not handle API keys.

## Full App Preview

The full app preview is hosted on OpenAI Sites:

https://linkedin-tools.sinisterpuppy.chatgpt.site

This build follows `main` and includes the experimental Assist workflow. Assist development is currently paused while the formatter is prepared for public contributors.

## Local Checks

Before publishing changes, run:

```bash
pnpm run lint
pnpm run build
```

Use Node.js 22.13 or newer, matching the version used by CI.
