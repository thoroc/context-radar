import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const stylesDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../src/styles");
const read = (name: string): string => readFileSync(resolve(stylesDir, name), "utf8");

/**
 * The stylesheet for a generated layer page, assembled from the same files the
 * bundled pages import so the chrome cannot look different here.
 *
 * page.css carries the reset, background and centred column; detail.css the
 * head, lede, two-column body, callout, verdict, status-dot and facts-panel
 * vocabulary, all scoped under the shared `.detail` wrapper; layer.css adds
 * only what is specific to layers.
 */
export const LAYER_STYLES = `${read("tokens.css")}${read("nav.css")}${read("page.css")}${read("detail.css")}${read("layer.css")}`;
