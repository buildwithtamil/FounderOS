#!/usr/bin/env node
/**
 * Build a single self-contained HTML file from a Vite dist/ output.
 * Inlines the JS bundle as a module script and the CSS as a <style> block,
 * inlines the favicon as a data URI, so the result can be published to
 * origins that serve exactly one HTML file (e.g. pages.bu.app).
 *
 * Usage: node scripts/inline-build.mjs <distDir> <outFile>
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const distDir = process.argv[2] || "dist";
const outFile = process.argv[3] || "outputs/founderos.html";

const assetsDir = join(distDir, "assets");
const assets = readdirSync(assetsDir);
const jsFile = assets.find((f) => f.endsWith(".js"));
const cssFile = assets.find((f) => f.endsWith(".css"));

if (!jsFile) throw new Error("No JS bundle found in " + assetsDir);

const js = readFileSync(join(assetsDir, jsFile), "utf8");
const css = cssFile ? readFileSync(join(assetsDir, cssFile), "utf8") : "";

let favicon = "";
try {
  const svg = readFileSync(join(distDir, "favicon.svg"), "utf8");
  favicon = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
} catch {
  /* favicon optional */
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="${favicon || "/favicon.svg"}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0b1220" />
    <meta name="description" content="FounderOS — One Company. One Operating System. Every Role. One Source of Truth." />
    <title>FounderOS</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${js}</script>
  </body>
</html>
`;

writeFileSync(outFile, html);
console.log(`Wrote ${outFile} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KiB)`);
