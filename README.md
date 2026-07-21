# Elijah Meir Vinluan — Portfolio

A responsive portfolio for UI/UX design, front-end engineering, and
security-aware delivery, built with React, TypeScript, Vite, and Tailwind CSS.
The project also includes a static-host-safe credential index at
[`/certifications/`](https://voltriv.github.io/certifications/).

## Requirements

- Node.js 20.19+ on the Node 20 release line, Node.js 22.12+ on the Node 22
  release line, or Node.js 24+
- npm 10

## Local development

```sh
npm install
npm run dev
```

Vite prints the local URL after the development server starts.

## Quality checks

```sh
npm run check
```

The check command runs TypeScript, ESLint, the Vitest interaction suite, and a
production build. To run an individual check, use `npm run typecheck`,
`npm run lint`, `npm run test`, or `npm run build`.

## Project structure

```text
src/
  components/          Shared UI components
  data/                Typed portfolio and credential content
  features/certifications/
                      Searchable credential index
  features/profile/    Main portfolio experience
  hooks/               Reusable React hooks
  styles/              Global and reset styles
```

Credential counts and filters are generated from
`src/data/certifications.ts`. Add only confirmed names, issuers, dates, IDs,
and verification URLs; the page intentionally shows an unpublished state when
that collection is empty.

## Deployment

Run `npm run deploy` to validate the project, build `dist/`, and publish it to
the `gh-pages` branch of
[`Voltriv/voltriv.github.io`](https://github.com/Voltriv/voltriv.github.io).
The public site is available at
[`https://voltriv.github.io/`](https://voltriv.github.io/).
