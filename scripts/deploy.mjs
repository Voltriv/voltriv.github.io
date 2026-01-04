#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nodeBin = process.execPath;

const run = (label, args) =>
  new Promise((resolveRun, reject) => {
    const proc = spawn(nodeBin, args, { cwd: rootDir, stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) {
        resolveRun();
        return;
      }
      reject(new Error(`${label} exited with code ${code}`));
    });
  });

try {
  await run("vite build", [resolve(rootDir, "node_modules/vite/bin/vite.js"), "build"]);
  await run("gh-pages", [
    resolve(rootDir, "node_modules/gh-pages/bin/gh-pages.js"),
    "-d",
    "dist",
    "-r",
    "https://github.com/voltriv/voltriv.github.io.git",
  ]);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
