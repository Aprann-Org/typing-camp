// Runs after `next build` (see package.json's "build" script). Walks the
// static export output in out/ and writes out/sw-manifest.json — the list
// of every file public/sw.js precaches on install.
//
// Deliberately unfiltered (no extension allowlist): Next's static export
// can emit non-.html/.js/.css payload files that some navigation path
// still needs, so anything narrower than "everything except this script's
// own outputs" risks silently dropping a file the app needs offline.
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT_DIR = join(process.cwd(), "out");
const MANIFEST_PATH = join(OUT_DIR, "sw-manifest.json");
const EXCLUDED_BASENAMES = new Set(["sw.js", "sw-manifest.json"]);

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile()) {
      if (EXCLUDED_BASENAMES.has(entry.name)) continue;
      files.push(fullPath);
    }
  }
  return files;
}

function toUrlPath(absPath) {
  const rel = relative(OUT_DIR, absPath).split(sep).join("/");
  return "/" + rel;
}

let stat;
try {
  stat = statSync(OUT_DIR);
} catch {
  console.error(`[generate-sw-manifest] out/ directory not found at ${OUT_DIR} — did "next build" run first?`);
  process.exit(1);
}
if (!stat.isDirectory()) {
  console.error(`[generate-sw-manifest] ${OUT_DIR} is not a directory`);
  process.exit(1);
}

const manifest = walk(OUT_DIR).map(toUrlPath).sort();
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log(`[generate-sw-manifest] wrote ${manifest.length} entries to ${relative(process.cwd(), MANIFEST_PATH)}`);
