import type { Plugin } from "vite";
import { injectTopbar } from "./inject-topbar";

/**
 * Renders the shared top bar into the three static HTML entries at build time.
 *
 * A build-time transform rather than a client-side mount: a bar assembled by
 * script flashes in on first paint and is simply absent with JavaScript off,
 * and the navigation is not the part of this site that should depend on JS.
 * The generated tool and markdown pages get the same bar from their own
 * generators, which render it into the HTML string directly.
 */
export const siteChrome = (): Plugin => ({
  name: "context-radar:site-chrome",
  transformIndexHtml: {
    order: "pre",
    handler(html, ctx) {
      return injectTopbar(html, ctx.path);
    },
  },
});
