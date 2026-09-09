/**
 * The heading for the modal overlay: a page title with its site-name suffix
 * removed.
 *
 * Whitespace is required on both sides of the dash, so a hyphenated tool name
 * such as lean-ctx is left alone.
 */
export const modalTitle = (title: string): string => title.split(/\s+[-–—]\s+/)[0];
