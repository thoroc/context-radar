/** What generated pages point at during `vite dev`, where nothing is hashed. */
export const DEV_CHROME_SRC = "/chrome/main.ts";

type BundleEntry = { type: string; isEntry?: boolean; name?: string; fileName: string };

/**
 * The hashed filename of the shared chrome chunk, prefixed with the calling
 * page's base so a page at `tools/rtk.html` gets `../assets/chrome-HASH.js`
 * and one at the root gets `./assets/chrome-HASH.js`.
 *
 * Read out of the bundle rather than passed between plugins: `generateBundle`
 * always receives final filenames, so every generator can look this up
 * independently and no plugin has to run before another.
 *
 * Throws rather than returning an empty string. Without the script the pages
 * still render and the theme toggle is simply inert on all 86 of them, with
 * nothing in the build output to say why -- a failure that surfaces only when
 * somebody clicks.
 */
export const chromeSrc = (bundle: Record<string, BundleEntry>, base: string): string => {
  const chunk = Object.values(bundle).find(
    (entry) => entry.type === "chunk" && entry.isEntry === true && entry.name === "chrome",
  );
  if (!chunk) {
    throw new Error(
      'context-radar: no "chrome" entry chunk in the bundle. Generated pages would ship without ' +
        "the theme toggle. Check that vite.config.ts still lists src/chrome/main.ts as an input.",
    );
  }
  return `${base}${chunk.fileName}`;
};
