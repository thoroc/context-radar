/// <reference types="vite/client" />

// Rendered Methodology/Glossary fragments, provided by the markdown-pages
// plugin, keyed by route (e.g. "methodology.html"), for the modal overlays.
declare module "virtual:context-radar-pages" {
  const pages: Record<string, { title: string; html: string }>;
  export default pages;
}
