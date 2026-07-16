/** Normalises an href to a bare route key (drops a leading "./" or "/"). */
export const routeOf = (href: string | null): string => (href ?? "").replace(/^\.?\//, "");
