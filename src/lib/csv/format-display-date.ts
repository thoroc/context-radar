/** Formats an ISO date (YYYY-MM-DD) as a display date in DD-MM-YYYY, e.g. "15-07-2026". */
export const formatDisplayDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map((n) => Number.parseInt(n, 10));
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${pad(d ?? 1)}-${pad(m ?? 1)}-${y}`;
};
