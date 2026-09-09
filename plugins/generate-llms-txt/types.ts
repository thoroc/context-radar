export interface GenerateLlmsTxtOptions {
  /** Absolute path to the canonical JSON store. */
  dataPath: string;
  /** Output filename served at the site root, e.g. `llms.txt`. */
  outFile: string;
}
