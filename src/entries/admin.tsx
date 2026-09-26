import React from "react";
import ReactDOM from "react-dom/client";
import { ContentAdmin } from "@/admin/ContentAdmin";

/**
 * Entry for the local content admin.
 *
 * Reachable only through the dev server: `admin/index.html` is deliberately
 * absent from the rollup inputs in vite.config.mts, so `npm run build` never
 * emits it and the deployed site has no admin surface at all.
 *
 * No Analytics or SpeedInsights here — this is a local tool, and it has no
 * business reporting to anything.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ContentAdmin />
  </React.StrictMode>,
);
