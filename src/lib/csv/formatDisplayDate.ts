const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats an ISO date (YYYY-MM-DD) as a short display date, e.g. "15 Jul 2026". */
export const formatDisplayDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map((n) => Number.parseInt(n, 10));
  return `${d} ${MONTHS[(m ?? 1) - 1] ?? ""} ${y}`;
};
