# Security Review

Last reviewed: 2026-08-29

## Scope

This review covered the repository source, tracked files, dependency audit, Git history checks for obvious secret patterns, and the current AI Assist key flow.

## Results

- No `.env` files, private key files, generated build folders, or package stores are tracked.
- No hardcoded API keys, GitHub tokens, provider tokens, or secret-looking values were found in source or Git history scans.
- Production dependency audit currently reports no known vulnerabilities.
- The public GitHub Pages demo is served from `static-no-assist`, so it does not expose Assist, Settings, server routes, or API-key inputs.

## Notes

The `main` branch still includes the experimental Assist workflow. API keys are entered by the user, stored in the browser, and sent to the app backend only when a generation request is made. Do not host the Assist version publicly unless the deployment environment, logging, request limits, and privacy language are reviewed again.
