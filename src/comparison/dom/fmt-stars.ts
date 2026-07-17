/** Compact star count for the table cell, e.g. 1234 becomes "1.2k". */
export const fmtStars = (stars: number | null): string => {
  if (stars === null) return "-";
  return stars >= 1000 ? `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(stars);
};
