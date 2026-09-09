/**
 * The slug a dev-server request addresses within a generated page directory, or
 * null when the request is for something else.
 *
 * Requires the directory prefix, so `/layers.html` does not match `layers` --
 * the index page sits beside the directory rather than inside it and needs its
 * own route. That only matters under `vite dev`, where these routes are served
 * by middleware rather than emitted as files.
 */
export const requestSlug = (url: string | undefined, outDir: string): string | null => {
  const path = (url ?? "").split("?")[0].replace(/^\//, "");
  const prefix = `${outDir}/`;
  if (!path.startsWith(prefix) || !path.endsWith(".html")) return null;
  return path.slice(prefix.length, -".html".length);
};
