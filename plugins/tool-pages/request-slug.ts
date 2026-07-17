export const requestSlug = (url: string | undefined, outDir: string): string | null => {
  const path = (url ?? "").split("?")[0].replace(/^\//, "");
  const prefix = `${outDir}/`;
  if (!path.startsWith(prefix) || !path.endsWith(".html")) return null;
  return path.slice(prefix.length, -".html".length);
};
