/**
 * Format a count for a compact badge: thousands as "71k"/"3.9k" (a trailing
 * ".0" dropped), sub-thousand as the plain integer, and a null count as "-".
 * Shared by the community-star total and the tool cards so the two never format
 * a star count differently.
 */
export const compactCount = (n: number | null): string => {
  if (n === null) return "-";
  if (n < 1000) return String(n);
  const k = (n / 1000).toFixed(1);
  return `${k.endsWith(".0") ? k.slice(0, -2) : k}k`;
};
