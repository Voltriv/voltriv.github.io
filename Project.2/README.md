
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
    views/             # Remaining experiences (Admin dashboard, etc.)
    components/
      ui/              # Design-system primitives (buttons, cards, inputs, dialog, etc.)
      figma/           # Visual helpers (ImageWithFallback, etc.)
    data/              # Typed content (e.g., profile data)
    hooks/             # Custom hooks (useSectionObserver)
    lib/               # Firebase config, services, constants
    styles/            # Global and preflight CSS
    assets/            # Static fallback media referenced via mediaAsset
  ```

  `App.tsx` lazy-loads the views so each experience ships as its own chunk, and the sections/shared components can be composed freely inside those views.

  ## Deploying to lava.github.io

  1. Make sure you have a Git remote that points to `https://github.com/lava/lava.github.io.git` (create that repo in the Lava account if it doesn't exist yet).
  2. Run `npm run deploy`. This builds the Vite app into `dist/` and publishes the contents straight to the `lava.github.io` repo via the GitHub Pages helper.
  3. Wait for the GitHub Pages deployment to finish, then visit https://lava.github.io to see the updated site.

  ## Firebase setup

  This project uses Firebase for the media library and admin uploads. Create a Firebase project, enable Firestore + Storage, then add these keys to a `.env` file in the project root:

  ```

If you want to temporarily skip Firebase authentication for the admin panel (useful for local/offline edits), leave `VITE_BYPASS_ADMIN_AUTH` unset (default) or set it to `true`. Set it to `false` in production so uploads stay protected.
  VITE_FIREBASE_API_KEY=...
  VITE_FIREBASE_AUTH_DOMAIN=...
  VITE_FIREBASE_PROJECT_ID=...
  VITE_FIREBASE_STORAGE_BUCKET=...
  VITE_FIREBASE_MESSAGING_SENDER_ID=...
  VITE_FIREBASE_APP_ID=...
  VITE_FIREBASE_MEASUREMENT_ID=...
  VITE_BYPASS_ADMIN_AUTH=false
  ```

  Restart `npm run dev` after adding the environment variables.

  ### Firebase Auth & security rules

  The admin dashboard uses Google Sign-In. In Firebase Console enable the **Google** provider under *Authentication → Sign-in method*.

  Replace your Firestore and Storage rules with the following (only authenticated users can write; reads stay public):

  **Firestore**
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /mediaEntries/{document=**} {
        allow read: if true;
        allow write: if request.auth != null;
      }
      match /loveNotes/{document=**} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
  }
  ```

  **Storage**
  ```
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /media/{allPaths=**} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
  }
  ```
  
