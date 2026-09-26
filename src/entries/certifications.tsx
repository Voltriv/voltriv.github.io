import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { CertificationsPage } from "@/features/certifications/CertificationsPage";
import { guardAgainstFraming } from "@/lib/frameGuard";
import "@/styles/index.css";

// See main.tsx: both entrypoints need the guard, since either can be framed.
const framed = import.meta.env.PROD && guardAgainstFraming();

if (!framed) {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <CertificationsPage />
      <Analytics />
      <SpeedInsights />
    </React.StrictMode>,
  );
}
