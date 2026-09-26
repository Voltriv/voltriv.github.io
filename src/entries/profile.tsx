import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "@/App";
import { guardAgainstFraming } from "@/lib/frameGuard";
import "@/styles/index.css";

// Checked before mounting: when the page is framed, the guard either sends the
// top frame here or empties the document, and in both cases there is nothing
// left worth rendering into.
const framed = import.meta.env.PROD && guardAgainstFraming();

if (!framed) {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
      <Analytics />
      <SpeedInsights />
    </React.StrictMode>,
  );
}
