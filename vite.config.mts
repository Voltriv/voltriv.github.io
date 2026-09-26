import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { contentApi } from "./vite-plugins/contentApi";

export default defineConfig({
  // contentApi is `apply: "serve"`, so the write endpoint exists only while
  // the dev server runs and never reaches a built artefact.
  plugins: [react(), contentApi()],
  build: {
    // `admin/index.html` is deliberately absent: listing the two real pages
    // explicitly is what keeps the local admin out of every deploy.
    rolldownOptions: {
      input: {
        profile: path.resolve(import.meta.dirname, "index.html"),
        certifications: path.resolve(
          import.meta.dirname,
          "certifications/index.html",
        ),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    testTimeout: 10_000,
  },
});
