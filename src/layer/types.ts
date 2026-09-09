/**
 * Options shared by the layer-page renderers. `base` prefixes internal links so
 * they resolve from wherever the page is mounted: `"../"` from a page under
 * `/layers/`, `"./"` from the index at the site root.
 */
export interface LayerContext {
  base: string;
  starsVerified: string;
}
