// The shared chunk for generated pages.
//
// The three static entries bundle their own main.ts, which already calls
// initThemeToggle. The 84 tool pages and the 2 markdown pages are emitted as
// raw asset strings by their Vite plugins, so Rollup never sees them and no
// script was ever injected into them. That is why the theme toggle did not
// exist on a generated page: not an oversight in the markup, an absence of any
// JavaScript at all.
//
// This module is a Rollup input (see vite.config.ts) so it gets bundled,
// hashed and typechecked like everything else; the generators look its final
// filename up in the bundle and reference it by relative path.
//
// Imported from the dom domain barrel rather than the root `lib` barrel on
// purpose: the root barrel re-exports the data domain, which loads the 283KB
// store at module scope, and pulling that into a chunk whose whole job is a
// theme button would ship the entire catalogue to every generated page. The
// same bundle-weight reasoning is why src/lib/index.ts refuses to re-export
// Zod's runtime values.
import { initThemeToggle } from "../lib/dom";

initThemeToggle();
