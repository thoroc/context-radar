export interface LayerPagesOptions {
  /** Absolute path to the canonical JSON store. */
  dataPath: string;
  /** Absolute path to the cross-tool recommendations file. */
  recsPath: string;
  /** Output directory (relative to the site root) the layer pages are emitted into. */
  outDir?: string;
}
