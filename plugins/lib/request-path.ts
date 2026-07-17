/** Strip the query string and leading slash from a dev-server request URL. */
export const requestPath = (url: string | undefined): string =>
  (url ?? "").split("?")[0].replace(/^\//, "");
