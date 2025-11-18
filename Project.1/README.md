
  # gf
  


  ## Tech stack

  - [Vite](https://vitejs.dev/) + React 18 + TypeScript
  - [Tailwind CSS](https://tailwindcss.com/) 3.x (configured via PostCSS)

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Project structure

  ```
  src/
    features/
      birthday/
        components/    # Birthday-only UI like the banner, playlist, fireworks
        BirthdayView.tsx
      story/
        components/    # Story-specific nav, backgrounds, counters, parallax, etc.
        sections/      # About, Gallery, Milestones, Love Notes
        StoryView.tsx
      profile/
        ProfileView.tsx # Portfolio/resume experience
    components/
      ui/              # Design-system primitives (buttons, cards, inputs, dialog, etc.)
      figma/           # Visual helpers (ImageWithFallback, etc.)
    data/              # Typed content (e.g., profile data)
    hooks/             # Custom hooks (useSectionObserver)
    lib/               # Shared constants and helpers
    styles/            # Global and preflight CSS
    assets/            # Static fallback media referenced via mediaAsset
  ```

  `App.tsx` lazy-loads the views so each experience ships as its own chunk, and the sections/shared components can be composed freely inside those views.

  ## Deploying to lava.github.io

  1. Make sure you have a Git remote that points to `https://github.com/lava/lava.github.io.git` (create that repo in the Lava account if it doesn't exist yet).
  2. Run `npm run deploy`. This builds the Vite app into `dist/` and publishes the contents straight to the `lava.github.io` repo via the GitHub Pages helper.
  3. Wait for the GitHub Pages deployment to finish, then visit https://lava.github.io to see the updated site.

  ## Managing media & notes (no Firebase required)

  All dynamic content now lives entirely in the repo so you can hardcode, version, and deploy everything without a backend.

  ### Gallery updates

  1. Add/replace files inside `public/pics and vid/`.
  2. Describe the assets in `scripts/media-metadata.json` (caption, category, credit, etc.).
  3. Run `npm run generate-media` (or any script that triggers `npm run predev`/`prebuild`). This regenerates `src/data/localMediaManifest.ts`, which the gallery consumes.

  ### Love notes

  - Notes added through the UI are stored in `localStorage`, so they persist on the device you're using.
  - For permanent or pre-seeded notes, edit the `fallbackNotes` array inside `src/features/story/sections/LoveNotesSection.tsx`.

  With Firebase removed, `.env` is only needed if you add new environment variables for future experiments.
