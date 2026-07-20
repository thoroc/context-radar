import type { ActivityBand } from "../../lib";

// Higher = healthier. Used only as the final tie-break in the ideal-pick ranking,
// so a livelier project edges out a dormant one at equal verdict and stars. Total
// over the band enum.
const RANK: Record<ActivityBand, number> = {
  active: 5,
  stable: 4,
  slowing: 3,
  early: 2,
  dormant: 1,
  none: 0,
};

export const activityRank = (band: ActivityBand): number => RANK[band];
