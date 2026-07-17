import type { Entry, Report } from "./types";

/** All tools whose recorded version is behind upstream: verdict-moving + observed. */
export const driftEntries = (report: Report): Entry[] => {
  return [...report.verdictMoving, ...report.observedOnly];
};
