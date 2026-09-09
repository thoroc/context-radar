/**
 * The nav href a transform context path corresponds to, so `renderTopbar` can
 * highlight the current page. Vite passes a URL path in dev and an absolute
 * filesystem path at build time, so both are reduced to a bare filename.
 */
export const activeRoute = (path: string): string => {
  const name = path.split(/[?#]/)[0].split("/").pop() ?? "";
  return name === "" ? "index.html" : name;
};
