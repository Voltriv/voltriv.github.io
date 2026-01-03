
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
      profile/
        ProfileView.tsx # Portfolio/resume experience
    components/
      ui/              # Design-system primitives (button, toaster, helpers)
      figma/           # Visual helpers (ImageWithFallback, etc.)
    data/              # Typed content (e.g., profile data)
    hooks/             # Custom hooks (useSectionObserver)
    styles/            # Global and preflight CSS
  ```

  `App.tsx` lazy-loads the profile view so it ships as its own chunk.

  ## Deploying to lava.github.io

  1. Make sure you have a Git remote that points to `https://github.com/lava/lava.github.io.git` (create that repo in the Lava account if it doesn't exist yet).
  2. Run `npm run deploy`. This builds the Vite app into `dist/` and publishes the contents straight to the `lava.github.io` repo via the GitHub Pages helper.
  3. Wait for the GitHub Pages deployment to finish, then visit https://lava.github.io to see the updated site.
