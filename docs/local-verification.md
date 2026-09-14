# Local completion and verification

Run the local quality gates:

```bash
npm test
npm run build
npm run lint
```

The browser-check harness uses in-memory fixtures for CALL-E and Buildathon and intercepts PocketBase requests, so it creates no records, votes, or browser identities in the production backend. Start Vite, then run:

```bash
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
COUNTDOWN_TEST_URL=http://127.0.0.1:5174 \
node scripts/browser-check.mjs
```

Chromium must be installed for the selected Playwright version. Review screenshots are written under `/tmp/countdown-*` and must not be committed.

## Poll integrity

The real `countdown_polls` and `countdown_poll_votes` collections are provisioned separately from the legacy CALL-E poll and are intentionally not seeded. Poll configuration is owner-only. A public voter can submit only to an enabled poll on an active public countdown, and cannot update or delete records.

Browser vote memory is a convenience, not proof of one-person-one-vote. Clearing browser storage can permit another vote. The current public-results view counts only stored choices and never fabricates votes. Stronger vote integrity would require server-side validation and is not claimed by the UI.
