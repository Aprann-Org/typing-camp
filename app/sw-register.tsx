"use client";

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline-first app with no server to report to; a failed registration
        // (e.g. opened directly from file:// instead of a local HTTP server)
        // just means this load won't be cached for next time.
      });
      return;
    }

    // A cache-first service worker actively fights `next dev`'s Fast
    // Refresh: dev asset URLs/content change on every save, but a SW keeps
    // serving what it cached, which shows up as an endless reload loop.
    // Never register in dev, and clean up any SW an earlier production
    // build test may have left controlling this origin.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }, []);

  return null;
}
