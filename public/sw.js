// Hand-written cache-first service worker for full offline operation.
//
// Bump CACHE_NAME on each release you ship to the field — this doesn't
// affect correctness (hashed /_next/static chunk filenames already change
// per build) but it evicts the previous release's cached files instead of
// letting old builds accumulate forever on a kiosk laptop's disk.
//
// IMPORTANT: service workers can only register in a secure context —
// HTTPS, or http://localhost. A laptop that opens index.html directly from
// a USB stick (file://) will never get this far; see the README's USB
// deployment instructions, which require running a local static server
// (npx serve out) rather than double-clicking the file.
const CACHE_NAME = "aprann-typing-v1";
const MANIFEST_URL = "/sw-manifest.json";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(MANIFEST_URL, { cache: "no-store" });
        const files = await response.json();
        await cache.addAll(files);
      } catch {
        // First install with no network yet (shouldn't happen in practice —
        // the manifest ships in the same build as this file) — fall back to
        // caching at least the shell so the app isn't left with nothing.
        await cache.addAll(["/"]);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

// A request for "/" (or "/teacher/") is a different cache key than the
// "/index.html" (or "/teacher/index.html") file next build actually wrote
// with trailingSlash:true — caches.match() does exact URL matching, so a
// plain lookup misses even though the content is cached. Fall back to the
// directory-index file before treating it as a real cache miss.
async function matchWithIndexFallback(request) {
  const direct = await caches.match(request);
  if (direct) return direct;

  const url = new URL(request.url);
  if (url.pathname.endsWith("/")) {
    return caches.match(url.pathname + "index.html");
  }
  if (!url.pathname.split("/").pop().includes(".")) {
    return caches.match(url.pathname + "/index.html");
  }
  return undefined;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cached = await matchWithIndexFallback(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    })()
  );
});
