import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `VITE_BASE` lets the same build target a subpath host (e.g. GitHub Pages at
// /FounderOS/). Defaults to "/" for root hosts (Vercel, Netlify, custom domain).
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
