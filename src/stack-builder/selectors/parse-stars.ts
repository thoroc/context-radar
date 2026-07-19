// Parse a curated star count string into a number. The data mixes plain
// counts ("529"), thousands ("71k", "3.9k", "56.5k"), approximations ("~1k")
// and a no-data dash ("-"). The "k"/"M" suffix is a multiplier, so it must
// scale the value rather than being stripped as a stray character (stripping
// turned "71k" into 71 and "56.5k" into 565, wrecking the running total).
export const parseStars = (raw: string): number => {
  const m = raw.match(/([0-9]+(?:\.[0-9]+)?)\s*([kKmM]?)/);
  if (!m) return 0;
  const base = Number.parseFloat(m[1]);
  if (Number.isNaN(base)) return 0;
  const suffix = m[2].toLowerCase();
  const mult = suffix === "k" ? 1000 : suffix === "m" ? 1_000_000 : 1;
  return base * mult;
};
