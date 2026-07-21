import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: {
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
