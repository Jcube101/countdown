# Countdown

A public, multi-countdown hub for project deadlines, launches, and shared events.

## Current scope

- Public library at `/`, containing active public countdowns
- Individual countdown pages at `/c/:slug`
- Browser-local display preferences at `/settings`
- Owner-only content management at `/manage`, authenticated by a PocketBase one-time email link
- Three code-owned visual systems: Midnight Chronograph, Studio Minimal, and Signal Board
- Archive rather than delete, preserving every published slug

The first seeded countdown is **CALL-E Hackathon**, at 14 September 2026, 9:30 PM IST. Its legacy site and legacy poll remain separate and unchanged.

## Routes

| Route | Audience | Purpose |
| --- | --- | --- |
| `/` | Public | Active public countdown library |
| `/c/:slug` | Public | One countdown detail page |
| `/settings` | Browser-local | Display preferences only, never deadline editing |
| `/manage` | Owner | Create, edit, and archive persistent countdowns |

## Data and access

PocketBase is the source of truth. The browser contains no PocketBase superuser credential.

- `countdown_items`: public read for active public records, owner-only create and update
- `countdown_owners`: dedicated owner authentication collection, configured for a 30-day token lifetime
- `archived: true`: retains the record and reserves its slug

The owner session is persisted by PocketBase's browser auth store and refreshed silently when valid. Clearing browser storage, logging out, using a new browser, or exceeding the session lifetime requires a new email link.

## Development

```bash
npm install
npm run build
npm run lint
npm run dev
```

`dist/` is generated output and is intentionally not committed. Do not deploy from a dirty source tree.

## Product rules

- Deadlines are stored as a date, time, and IANA timezone. Never treat them as a viewer-local timestamp.
- Published slugs are stable. Generate a kebab-case proposal from the title, check uniqueness, and let the owner adjust it before publishing.
- Polls are optional and per-countdown. They use their own records and must not reuse the legacy `calle_countdown_votes` collection.
- CALL-E starts without a poll on this hub.
- Read `DESIGN.md` before changing visual design, interaction hierarchy, or information architecture.

## Release order

1. Pull and inspect remote changes.
2. Build, lint, and run the relevant tests.
3. Commit and push the source.
4. Obtain explicit approval before deploying externally.
5. Deploy only the freshly built `dist/` directory and verify the live SPA routes.
