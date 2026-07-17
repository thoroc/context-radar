export interface GenerateCsvOptions {
  /** Absolute path to the canonical JSON store. */
  dataPath: string;
  /** Output filename served at the site root, e.g. `context-reduction-tools.csv`. */
  outFile: string;
}
