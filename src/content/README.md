# Content

Editable content lives here as JSON, one file per entry. Git is the database.

## Editing

```sh
npm run cms
```

Opens the local admin at `http://localhost:5173/admin/`, with a tab per
collection. Add, edit and delete entries through the form; each save writes a
file under the matching directory. Then commit as usual:

```sh
git add src/content && git commit -m "Add entry" && npm run deploy
```

Nothing is published until you deploy. There is no live CMS.

## Layout

```
src/content/
  index.ts              the only public surface — import from "@/content"
  load.ts               glob → parse → reject duplicate ids → sort
  schema/               code: one module per collection, plus validate.ts
  entries/              data: the JSON files the admin writes
```

Code and data are separated on purpose. `entries/` is the part you edit
through the admin and review in a diff; `schema/` is the part that decides
whether an entry is valid. Mixing them made it unclear which files were
authored by hand and which were generated.

## Collections

| Directory | Feeds | Ordered by |
| --- | --- | --- |
| `entries/certifications/` | the credentials page | `issuedYear` desc, then `name` |
| `entries/experience/` | the profile page | `startDate` desc, then `company` |
| `entries/projects/` | the profile page | `order` asc, then `title` |

An empty collection is legitimate — the page renders its empty state.

## Why it works this way

This site is static, hosted on GitHub Pages, and both pages ship a strict
`Content-Security-Policy` with `connect-src 'self'`. A hosted headless CMS
would have to be fetched at runtime, which that policy blocks — adopting one
would mean widening the CSP and giving the published page a live network
dependency. So content is resolved at **build time** instead:

- `schema/validate.ts` — the shared validation primitives. Every schema builds
  on these, so all three enforce the same rules and produce the same error
  shape.
- `schema/<collection>.ts` — its type, its `parse*` function and its sort
  order. Shared by the app *and* the dev-only write endpoint, so the admin UI
  cannot save a record the build would reject.
- `load.ts` — glob → parse → reject duplicate ids → sort. `import.meta.glob`
  cannot take a variable (Vite resolves it statically), so `index.ts` spells
  out one glob per collection.
- `vite-plugins/contentApi.ts` — the write half. Marked `apply: "serve"`, so
  it exists only while the dev server runs and is never part of a build.
- `vite-plugins/requestGuard.ts` — origin and `Host` validation plus a token
  bucket for the dev endpoint. See "Why the dev endpoint is guarded" below.
- `admin/index.html` — deliberately absent from the rollup inputs in
  `vite.config.mts`, so `npm run build` never emits it.

## Why the dev endpoint is guarded

The dev server listens on localhost, which feels private but is not: every
page open in the same browser can reach it.

- **CSRF.** Any site can `fetch("http://localhost:5173/__content/projects")`.
  A JSON `PUT` is preflighted and drops, but a `GET` is a *simple* request and
  goes straight through — so a hostile page could enumerate the collections.
  The origin check stops that.
- **DNS rebinding.** An attacker's domain re-resolves to 127.0.0.1, after
  which the browser treats the request as same-origin and skips the preflight
  entirely. Origin checks do not help; validating the `Host` header does,
  because a rebound request still carries the attacker's hostname.
- **Rate limiting.** A token bucket (30 burst, refilling 2/s) caps how much
  any runaway or automated caller can do. Bursty because saving several
  entries in a row is normal editing.

None of this ships — the guard lives in the same `apply: "serve"` plugin.

Validation runs at module load, so a malformed entry fails `npm run build` and
the dev server rather than reaching production as an empty card. The deployed
artefact is exactly as static as it was before: no admin route, no content
API, no new runtime dependency, no CSP change.

## Schemas

### `certifications/`

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | lowercase kebab-case; doubles as the filename |
| `name` | yes | |
| `issuer` | yes | |
| `category` | yes | one of `Design`, `Security`, `Engineering`, `Cloud` |
| `issuedYear` | yes | string, e.g. `"2026"` |
| `credentialId` | no | |
| `verificationUrl` | no | must be `https:` |
| `skills` | no | array of strings |

### `experience/`

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | lowercase kebab-case; doubles as the filename |
| `company` | yes | |
| `role` | yes | |
| `period` | yes | display string, shown verbatim |
| `startDate` | yes | `YYYY-MM`, **ordering only** — never rendered |
| `summary` | yes | |
| `bullets` | yes | array of strings, at least one |

`period` and `startDate` are separate on purpose: `period` is free text
because it is what the reader sees, and free text cannot be sorted.

### `projects/`

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | lowercase kebab-case; doubles as the filename |
| `title` | yes | |
| `description` | yes | |
| `link` | yes | https URL, or a same-site path starting with `/` or `#` |
| `order` | no | number, defaults to `0`; lower sorts first |

`order` rather than a date, because a portfolio is curated — the piece that
should lead is not necessarily the newest.

## Adding another collection

1. Add a `*.schema.ts` with a type, a `parse*` built on `validate.ts`
   primitives, and a sort function.
2. Add a loader in `src/data/` calling `loadCollection` with its own
   `import.meta.glob`.
3. Register the parser in the `COLLECTIONS` map in
   `vite-plugins/contentApi.ts`.
4. Add a spec to `COLLECTIONS` in `src/admin/collections.ts` — the admin form
   is generated from it, so no new UI code is needed.

Keep schema modules free of `import.meta.glob`, DOM access and Node built-ins:
the Vite config loads them in plain Node, and the browser loads them in the
admin bundle.
